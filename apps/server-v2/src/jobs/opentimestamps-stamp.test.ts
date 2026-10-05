import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schedule } from "effect";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { postOts } from "@/db/schema";
import { makeQueuesTestLayer } from "@/jobs";
import { JobAdminService, type QueueStats } from "@/queue/admin";
import { ArweaveService } from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import {
  OTS_TEST_PENDING_PROOF,
  OpenTimestampsService,
  type OpenTimestampsOperations,
} from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import {
  createTestPost,
  createTestPostOts,
  createTestUser,
} from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";
import { processOpenTimestampsStampJob } from "./opentimestamps-stamp";
import { opentimestampsUpgradeJob } from "./opentimestamps-upgrade";

const makeStampTestLayer = (
  overrides: Partial<OpenTimestampsOperations> = {},
) =>
  makeQueuesTestLayer({
    enableWorkers: false,
    maxAttempts: 2,
    retrySchedule: Schedule.spaced("0 millis"),
  }).pipe(
    Layer.provideMerge(OpenTimestampsService.layerTest(overrides)),
    Layer.provideMerge(ArweaveService.layerTest()),
    Layer.provideMerge(PostHogService.layerTest()),
    Layer.provideMerge(AppConfig.layerTest()),
    Layer.provideMerge(ImageProcessingService.layer),
    Layer.provideMerge(TestDatabaseLayer),
  );

const findUpgradeQueue = (stats: ReadonlyArray<QueueStats>) =>
  stats.find((queue) => queue.queueName === opentimestampsUpgradeJob.name);

describe("opentimestamps stamp job", () => {
  it.effect(
    "stamps the content hash, stores the proof and schedules the upgrade",
    () => {
      const stampedHashes: Array<string> = [];

      return Effect.gen(function* () {
        const db = yield* Database;
        const admin = yield* JobAdminService;
        const user = yield* createTestUser();

        yield* createTestPost({ id: "post-stamp", userId: user.id });
        yield* createTestPostOts({
          postId: "post-stamp",
          contentHash: "b".repeat(64),
        });

        yield* processOpenTimestampsStampJob({ postId: "post-stamp" });

        const [row] = yield* db
          .select()
          .from(postOts)
          .where(eq(postOts.postId, "post-stamp"));

        const upgradeQueue = findUpgradeQueue(yield* admin.getQueueStats);

        expect({
          stampedHashes,
          status: row?.status,
          pendingProof: row?.pendingProof,
          upgradeQueuePending: upgradeQueue?.pending,
        }).toStrictEqual({
          stampedHashes: ["b".repeat(64)],
          status: "PENDING",
          pendingProof: OTS_TEST_PENDING_PROOF,
          upgradeQueuePending: 1,
        });
      }).pipe(
        Effect.provide(
          makeStampTestLayer({
            stamp: (contentHash) =>
              Effect.sync(() => {
                stampedHashes.push(contentHash);

                return OTS_TEST_PENDING_PROOF;
              }),
          }),
        ),
      );
    },
  );

  it.effect(
    "reuses an existing pending proof and only schedules the upgrade",
    () => {
      const stampedHashes: Array<string> = [];

      return Effect.gen(function* () {
        const db = yield* Database;
        const admin = yield* JobAdminService;
        const user = yield* createTestUser();

        yield* createTestPost({ id: "post-reuse", userId: user.id });
        yield* createTestPostOts({
          postId: "post-reuse",
          pendingProof: Buffer.from("existing-proof"),
        });

        yield* processOpenTimestampsStampJob({ postId: "post-reuse" });

        const [row] = yield* db
          .select()
          .from(postOts)
          .where(eq(postOts.postId, "post-reuse"));

        const upgradeQueue = findUpgradeQueue(yield* admin.getQueueStats);

        expect({
          stampedHashes,
          pendingProof: row?.pendingProof,
          upgradeQueuePending: upgradeQueue?.pending,
        }).toStrictEqual({
          stampedHashes: [],
          pendingProof: Buffer.from("existing-proof"),
          upgradeQueuePending: 1,
        });
      }).pipe(
        Effect.provide(
          makeStampTestLayer({
            stamp: (contentHash) =>
              Effect.sync(() => {
                stampedHashes.push(contentHash);

                return OTS_TEST_PENDING_PROOF;
              }),
          }),
        ),
      );
    },
  );

  it.effect("does nothing when the post has no OpenTimestamps row", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;

      yield* processOpenTimestampsStampJob({ postId: "post-missing" });

      expect(yield* admin.getQueueStats).toStrictEqual([]);
    }).pipe(Effect.provide(makeStampTestLayer())),
  );

  it.effect("does nothing when the proof is already upgraded", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;
      const user = yield* createTestUser();

      yield* createTestPost({ id: "post-upgraded", userId: user.id });
      yield* createTestPostOts({
        postId: "post-upgraded",
        status: "UPGRADED",
        otsTxId: "ots-tx",
        pendingProof: null,
      });

      yield* processOpenTimestampsStampJob({ postId: "post-upgraded" });

      expect(yield* admin.getQueueStats).toStrictEqual([]);
    }).pipe(Effect.provide(makeStampTestLayer())),
  );
});
