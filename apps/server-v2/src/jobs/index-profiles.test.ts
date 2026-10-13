import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Schedule, Schema } from "effect";
import { type HttpClientRequest } from "effect/http";
import { AppConfig } from "@/config";
import { makeQueuesTestLayer } from "@/jobs";
import { indexProfileJob, indexProfileJobId } from "@/jobs/index-profile";
import {
  indexProfilesScanJobId,
  processIndexProfilesJob,
} from "@/jobs/index-profiles";
import { JobAdminService, type QueueStats } from "@/queue/admin";
import { ArweaveService } from "@/services/arweave";
import {
  type ArweaveGraphQLTestResponse,
  ArweaveGraphQLService,
} from "@/services/arweave-graphql";
import { ImageProcessingService } from "@/services/image-processing";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import {
  createTestProfile,
  createTestUser,
  createTestWalletAddress,
} from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";

const RequestBodySchema = Schema.Struct({
  query: Schema.String,
  variables: Schema.Struct({
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

const makeEdge = (txId: string, blockHeight = 10) => ({
  cursor: `cursor-${txId}`,
  node: {
    id: txId,
    block: { height: blockHeight, timestamp: 1_700_000_000 },
  },
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

describe("index profiles job", () => {
  it.effect(
    "offers jobs for new transactions and profiles stored on upload, skipping indexed ones",
    () => {
      const edges = [
        makeEdge("tx-indexed", 30),
        makeEdge("tx-own-upload"),
        makeEdge("tx-new"),
      ];

      return Effect.gen(function* () {
        const admin = yield* JobAdminService;
        const indexedUser = yield* createTestUser();

        const indexedWallet = yield* createTestWalletAddress({
          userId: indexedUser.id,
          address: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
        });

        const uploadUser = yield* createTestUser();

        const uploadWallet = yield* createTestWalletAddress({
          userId: uploadUser.id,
          address: "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP",
        });

        yield* createTestProfile({
          userId: indexedUser.id,
          walletAddressId: indexedWallet.id,
          arweaveTxId: "tx-indexed",
          arweaveBlockHeight: 30,
        });

        yield* createTestProfile({
          userId: uploadUser.id,
          walletAddressId: uploadWallet.id,
          arweaveTxId: "tx-own-upload",
          arweaveBlockHeight: null,
        });

        yield* processIndexProfilesJob;

        const queue = (yield* admin.getQueueStats).find(
          (stats: QueueStats) => stats.queueName === indexProfileJob.name,
        );

        const indexed = yield* admin.getJobState(
          indexProfileJob.name,
          indexProfileJobId("tx-indexed"),
        );

        const ownUpload = yield* admin.getJobState(
          indexProfileJob.name,
          indexProfileJobId("tx-own-upload"),
        );

        const fresh = yield* admin.getJobState(
          indexProfileJob.name,
          indexProfileJobId("tx-new"),
        );

        expect({
          pending: queue?.pending,
          indexed: indexed !== null,
          ownUpload: ownUpload !== null,
          fresh: fresh !== null,
        }).toStrictEqual({
          pending: 2,
          indexed: false,
          ownUpload: true,
          fresh: true,
        });
      }).pipe(
        Effect.provide(
          makeTestLayer(() => ({
            body: { data: { transactions: { edges } } },
          })),
        ),
      );
    },
  );

  it.effect("scans from the latest indexed block height", () => {
    const requests: Array<ReturnType<typeof requestBody>> = [];

    return Effect.gen(function* () {
      const user = yield* createTestUser();

      const wallet = yield* createTestWalletAddress({
        userId: user.id,
        address: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
      });

      yield* createTestProfile({
        userId: user.id,
        walletAddressId: wallet.id,
        arweaveBlockHeight: 88,
      });

      yield* processIndexProfilesJob;

      expect(requests[0]?.variables.minBlockHeight).toBe(88);
    }).pipe(
      Effect.provide(
        makeTestLayer((request) => {
          requests.push(requestBody(request));

          return { body: { data: { transactions: { edges: [] } } } };
        }),
      ),
    );
  });

  it("uses a stable scan id per interval bucket", () => {
    expect(indexProfilesScanJobId(0)).toBe(
      indexProfilesScanJobId(9 * 60 * 1000),
    );
    expect(indexProfilesScanJobId(0)).not.toBe(
      indexProfilesScanJobId(11 * 60 * 1000),
    );
  });
});
