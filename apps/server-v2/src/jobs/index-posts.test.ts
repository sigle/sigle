import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Schedule, Schema } from "effect";
import { type HttpClientRequest } from "effect/http";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { postRevision } from "@/db/schema";
import { makeQueuesTestLayer } from "@/jobs";
import { indexPostJob, indexPostJobId } from "@/jobs/index-post";
import { indexPostsScanJobId, processIndexPostsJob } from "@/jobs/index-posts";
import { JobAdminService, type QueueStats } from "@/queue/admin";
import { ArweaveService } from "@/services/arweave";
import {
  type ArweaveGraphQLTestResponse,
  ArweaveGraphQLService,
} from "@/services/arweave-graphql";
import { ImageProcessingService } from "@/services/image-processing";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import { createTestPost, createTestUser } from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";

const RequestBodySchema = Schema.Struct({
  query: Schema.String,
  variables: Schema.Struct({
    tags: Schema.optionalKey(
      Schema.Array(
        Schema.Struct({
          name: Schema.String,
          values: Schema.Array(Schema.String),
        }),
      ),
    ),
    minBlockHeight: Schema.optionalKey(Schema.Finite),
    after: Schema.optionalKey(Schema.String),
  }),
});

const RequestBodyJsonSchema = Schema.fromJsonString(RequestBodySchema);

const EncodedBodySchema = Schema.Struct({
  body: Schema.optionalKey(Schema.String),
});

const requestBody = (request: HttpClientRequest.HttpClientRequest) => {
  const encoded = Schema.decodeUnknownSync(EncodedBodySchema)(
    request.body.toJSON(),
  );

  return Schema.decodeSync(RequestBodyJsonSchema)(encoded.body ?? "null");
};

const makeEdge = (
  txId: string,
  tags: ReadonlyArray<{ name: string; value: string }>,
) => ({
  cursor: `cursor-${txId}`,
  node: {
    id: txId,
    tags,
    block: { height: 10, timestamp: 1_700_000_000 },
  },
});

const appNameTag = { name: "App-Name", value: "sigle-test" };

const profileTag = { name: "Type", value: "profile" };

const respondWithEdges =
  (edges: ReadonlyArray<ReturnType<typeof makeEdge>>) =>
  (): ArweaveGraphQLTestResponse => ({
    body: { data: { transactions: { edges } } },
  });

const makeTestLayer = (
  respond: (
    request: HttpClientRequest.HttpClientRequest,
  ) => ArweaveGraphQLTestResponse,
) =>
  Layer.merge(
    ArweaveGraphQLService.layerTest(respond),
    makeQueuesTestLayer({
      enableWorkers: false,
      maxAttempts: 1,
      retrySchedule: Schedule.spaced("0 millis"),
    }),
  ).pipe(
    Layer.provideMerge(OpenTimestampsService.layerTest()),
    Layer.provideMerge(ArweaveService.layerTest()),
    Layer.provideMerge(PostHogService.layerTest()),
    Layer.provideMerge(AppConfig.layerTest()),
    Layer.provideMerge(ImageProcessingService.layer),
    Layer.provideMerge(TestDatabaseLayer),
  );

describe("index posts job", () => {
  it.effect(
    "offers jobs for new transactions and skips profiles, known posts and revisions",
    () => {
      const edges = [
        makeEdge("tx-new", [appNameTag]),
        makeEdge("tx-profile", [appNameTag, profileTag]),
        makeEdge("tx-known", [appNameTag]),
        makeEdge("tx-rev", [appNameTag]),
      ];

      return Effect.gen(function* () {
        const admin = yield* JobAdminService;
        const db = yield* Database;
        const author = yield* createTestUser();

        yield* createTestPost({
          id: "post-1",
          userId: author.id,
          arweaveTxId: "tx-known",
        });

        yield* db
          .insert(postRevision)
          .values({
            id: crypto.randomUUID(),
            postId: "post-1",
            txId: "tx-rev",
          })
          .pipe(Effect.orDie);

        yield* processIndexPostsJob;

        const queue = (yield* admin.getQueueStats).find(
          (stats: QueueStats) => stats.queueName === indexPostJob.name,
        );

        const offered = yield* admin.getJobState(
          indexPostJob.name,
          indexPostJobId("tx-new"),
        );

        const profile = yield* admin.getJobState(
          indexPostJob.name,
          indexPostJobId("tx-profile"),
        );

        const known = yield* admin.getJobState(
          indexPostJob.name,
          indexPostJobId("tx-known"),
        );

        const revision = yield* admin.getJobState(
          indexPostJob.name,
          indexPostJobId("tx-rev"),
        );

        expect({
          pending: queue?.pending,
          offered: offered !== null,
          profile: profile !== null,
          known: known !== null,
          revision: revision !== null,
        }).toStrictEqual({
          pending: 1,
          offered: true,
          profile: false,
          known: false,
          revision: false,
        });
      }).pipe(Effect.provide(makeTestLayer(respondWithEdges(edges))));
    },
  );

  it.effect("scans from the latest indexed block height", () => {
    const requests: Array<ReturnType<typeof requestBody>> = [];

    return Effect.gen(function* () {
      const author = yield* createTestUser();

      yield* createTestPost({
        id: "post-1",
        userId: author.id,
        arweaveBlockHeight: 42,
      });

      yield* processIndexPostsJob;

      expect(requests[0]?.variables.minBlockHeight).toBe(42);
    }).pipe(
      Effect.provide(
        makeTestLayer((request) => {
          requests.push(requestBody(request));

          return { body: { data: { transactions: { edges: [] } } } };
        }),
      ),
    );
  });

  it.effect("pages through results with the last cursor", () => {
    const firstPage = Array.from({ length: 100 }, (_value, index) =>
      makeEdge(`tx-${index}`, [appNameTag]),
    );

    const calls: Array<ReturnType<typeof requestBody>> = [];

    return Effect.gen(function* () {
      const admin = yield* JobAdminService;

      yield* processIndexPostsJob;

      const queue = (yield* admin.getQueueStats).find(
        (stats: QueueStats) => stats.queueName === indexPostJob.name,
      );

      expect({
        after: calls[1]?.variables.after,
        pending: queue?.pending,
      }).toStrictEqual({
        after: "cursor-tx-99",
        pending: 101,
      });
    }).pipe(
      Effect.provide(
        makeTestLayer((request) => {
          const body = requestBody(request);

          calls.push(body);

          const edges =
            body.variables.after === undefined
              ? firstPage
              : [makeEdge("tx-last", [appNameTag])];

          return { body: { data: { transactions: { edges } } } };
        }),
      ),
    );
  });

  it("uses a stable scan id per interval bucket", () => {
    expect(indexPostsScanJobId(0)).toBe(indexPostsScanJobId(9 * 60 * 1000));
    expect(indexPostsScanJobId(0)).not.toBe(
      indexPostsScanJobId(11 * 60 * 1000),
    );
  });
});
