import { describe, expect, it } from "@effect/vitest";
import { PostMetadataSchemaId } from "@sigle/sdk";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schedule, Schema } from "effect";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { mediaImage, post, postRevision, walletAddress } from "@/db/schema";
import { makeQueuesTestLayer } from "@/jobs";
import { generateImageThumbhashJob } from "@/jobs/generate-image-thumbhash";
import { type IndexPostJob, processIndexPostJob } from "@/jobs/index-post";
import { JobAdminService, type QueueStats } from "@/queue/admin";
import { ArweaveService } from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import { MediaImagesService } from "@/services/media-images";
import { MetadataService } from "@/services/metadata";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import { UserProvisioningService } from "@/services/user-provisioning";
import {
  createSignedTestPostMetadata,
  createTestDraft,
  createTestSiwsCredentials,
  createTestUser,
  signTestSiwsMessage,
} from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";

const credentials = createTestSiwsCredentials("testnet");

const toJson = <T>(value: T): Schema.Json => JSON.parse(JSON.stringify(value));

const makeTestLayer = (respond: (url: string) => Schema.Json) =>
  Layer.mergeAll(
    MetadataService.layerTest(respond),
    UserProvisioningService.layer,
    MediaImagesService.layer,
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

const signedMetadata = (overrides: { title?: string } = {}) =>
  createSignedTestPostMetadata({
    draftId: "draft-1",
    privateKey: credentials.privateKey,
    ...overrides,
  });

const makeJob = (overrides: Partial<IndexPostJob> = {}): IndexPostJob => ({
  txId: "tx-1",
  blockHeight: 10,
  blockTimestamp: 1_700_000_000,
  uri: "ar://tx-1",
  ...overrides,
});

const findPost = (id: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [row] = yield* db
      .select()
      .from(post)
      .where(eq(post.id, id))
      .limit(1)
      .pipe(Effect.orDie);

    return row;
  });

const findRevisions = (postId: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const rows = yield* db
      .select()
      .from(postRevision)
      .where(eq(postRevision.postId, postId))
      .orderBy(postRevision.txId)
      .pipe(Effect.orDie);

    return rows;
  });

describe("index post job", () => {
  it.effect("creates the post, its revision and the author wallet", () => {
    const signed = signedMetadata();

    return Effect.gen(function* () {
      yield* processIndexPostJob(makeJob());

      const created = yield* findPost("tx-1");
      const revisions = yield* findRevisions("tx-1");

      expect({
        id: created?.id,
        arweaveTxId: created?.arweaveTxId,
        arweaveBlockHeight: created?.arweaveBlockHeight,
        title: created?.title,
        content: created?.content,
        tags: created?.tags,
        signature: created?.signature,
        revisionsCount: created?.revisionsCount,
        draftId: created?.draftId,
        revisions: revisions.map((revision) => revision.txId),
      }).toStrictEqual({
        id: "tx-1",
        arweaveTxId: "tx-1",
        arweaveBlockHeight: 10,
        title: "Published Title",
        content: "Hello **Arweave** world!",
        tags: ["web3", "effect"],
        signature: signed.signature,
        revisionsCount: 1,
        draftId: null,
        revisions: ["tx-1"],
      });

      const db = yield* Database;

      const [wallet] = yield* db
        .select()
        .from(walletAddress)
        .where(eq(walletAddress.address, credentials.address))
        .limit(1)
        .pipe(Effect.orDie);

      expect(wallet?.userId).toBe(created?.userId);
    }).pipe(Effect.provide(makeTestLayer(() => toJson(signed))));
  });

  it.effect(
    "attaches a newer transaction as a revision of its root post",
    () => {
      const first = signedMetadata({ title: "First" });
      const second = signedMetadata({ title: "Second" });

      let call = 0;

      return Effect.gen(function* () {
        yield* processIndexPostJob(makeJob({ uri: "ar://tx-1" }));
        yield* processIndexPostJob(
          makeJob({
            txId: "tx-2",
            rootTxId: "tx-1",
            blockHeight: 20,
            uri: "ar://tx-2",
          }),
        );

        const updated = yield* findPost("tx-1");
        const revisions = yield* findRevisions("tx-1");
        const rootPost = yield* findPost("tx-2");

        expect({
          postId: updated?.id,
          arweaveTxId: updated?.arweaveTxId,
          title: updated?.title,
          revisionsCount: updated?.revisionsCount,
          revisions: revisions.map((revision) => revision.txId),
          duplicatePost: rootPost,
        }).toStrictEqual({
          postId: "tx-1",
          arweaveTxId: "tx-2",
          title: "Second",
          revisionsCount: 2,
          revisions: ["tx-1", "tx-2"],
          duplicatePost: undefined,
        });
      }).pipe(
        Effect.provide(
          makeTestLayer(() => {
            call += 1;

            return toJson(call === 1 ? first : second);
          }),
        ),
      );
    },
  );

  it.effect("skips an older revision of a post", () => {
    const first = signedMetadata({ title: "First" });
    const older = signedMetadata({ title: "Older" });

    let call = 0;

    return Effect.gen(function* () {
      yield* processIndexPostJob(makeJob({ blockHeight: 20 }));
      yield* processIndexPostJob(
        makeJob({
          txId: "tx-old",
          rootTxId: "tx-1",
          blockHeight: 10,
          uri: "ar://tx-old",
        }),
      );

      const found = yield* findPost("tx-1");
      const revisions = yield* findRevisions("tx-1");
      const stalePost = yield* findPost("tx-old");

      expect({
        arweaveTxId: found?.arweaveTxId,
        revisionsCount: found?.revisionsCount,
        revisions: revisions.map((revision) => revision.txId),
        stalePost,
      }).toStrictEqual({
        arweaveTxId: "tx-1",
        revisionsCount: 1,
        revisions: ["tx-1"],
        stalePost: undefined,
      });
    }).pipe(
      Effect.provide(
        makeTestLayer(() => {
          call += 1;

          return toJson(call === 1 ? first : older);
        }),
      ),
    );
  });

  it.effect("skips a replayed signature under another transaction", () => {
    const signed = signedMetadata();

    return Effect.gen(function* () {
      yield* processIndexPostJob(makeJob({ uri: "ar://tx-1" }));
      yield* processIndexPostJob(
        makeJob({
          txId: "tx-replay",
          blockHeight: 20,
          uri: "ar://tx-replay",
        }),
      );

      const replayed = yield* findPost("tx-replay");

      expect(replayed).toBeUndefined();
    }).pipe(Effect.provide(makeTestLayer(() => toJson(signed))));
  });

  it.effect("skips a transaction owned by an in-flight draft", () => {
    const signed = signedMetadata();

    return Effect.gen(function* () {
      const author = yield* createTestUser();

      yield* createTestDraft({
        userId: author.id,
        arweaveTxId: "tx-1",
      });

      yield* processIndexPostJob(makeJob());

      const skipped = yield* findPost("tx-1");

      expect(skipped).toBeUndefined();
    }).pipe(Effect.provide(makeTestLayer(() => toJson(signed))));
  });

  it.effect("skips invalid metadata without failing", () => {
    return Effect.gen(function* () {
      yield* processIndexPostJob(makeJob());

      const skipped = yield* findPost("tx-1");
      const revisions = yield* findRevisions("tx-1");

      expect({ skipped, revisions }).toStrictEqual({
        skipped: undefined,
        revisions: [],
      });
    }).pipe(Effect.provide(makeTestLayer(() => ({ hello: "world" }))));
  });

  it.effect("creates the cover media row and schedules its thumbhash", () => {
    const metadataWithoutSignature = {
      $schema: PostMetadataSchemaId.LATEST,
      content: {
        id: "draft-1",
        title: "With cover",
        content: "Body",
        coverImage: {
          url: "https://cdn.test/cover.png",
          type: "image/png",
        },
      },
    };

    const signature = signTestSiwsMessage(
      JSON.stringify(metadataWithoutSignature),
      credentials.privateKey,
    );

    const signed = { ...metadataWithoutSignature, signature };

    return Effect.gen(function* () {
      yield* processIndexPostJob(makeJob());

      const db = yield* Database;
      const admin = yield* JobAdminService;

      const [cover] = yield* db
        .select()
        .from(mediaImage)
        .where(eq(mediaImage.id, "https://cdn.test/cover.png"))
        .limit(1)
        .pipe(Effect.orDie);

      const queue = (yield* admin.getQueueStats).find(
        (stats: QueueStats) =>
          stats.queueName === generateImageThumbhashJob.name,
      );

      expect({
        coverStatus: cover?.status,
        pending: queue?.pending,
      }).toStrictEqual({
        coverStatus: "PENDING",
        pending: 1,
      });
    }).pipe(Effect.provide(makeTestLayer(() => toJson(signed))));
  });
});
