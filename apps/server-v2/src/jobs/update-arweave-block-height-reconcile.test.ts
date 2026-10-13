import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Schedule } from "effect";
import { AppConfig } from "@/config";
import { makeQueuesTestLayer } from "@/jobs";
import {
  blockHeightJobId,
  updateArweaveBlockHeightJob,
} from "@/jobs/update-arweave-block-height";
import { reconcilePostBlockHeights } from "@/jobs/update-arweave-block-height-reconcile";
import { JobAdminService, type QueueStats } from "@/queue/admin";
import { ArweaveService } from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import { createTestPost, createTestUser } from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";

const makeTestLayer = () =>
  makeQueuesTestLayer({
    enableWorkers: false,
    maxAttempts: 2,
    retrySchedule: Schedule.spaced("0 millis"),
  }).pipe(
    Layer.provideMerge(OpenTimestampsService.layerTest()),
    Layer.provideMerge(ArweaveService.layerTest()),
    Layer.provideMerge(PostHogService.layerTest()),
    Layer.provideMerge(AppConfig.layerTest()),
    Layer.provideMerge(ImageProcessingService.layer),
    Layer.provideMerge(TestDatabaseLayer),
  );

const staleDate = () => new Date(Date.now() - 16 * 60 * 1000);

const findQueue = (stats: ReadonlyArray<QueueStats>) =>
  stats.find((queue) => queue.queueName === updateArweaveBlockHeightJob.name);

describe("post block height reconciliation", () => {
  it.effect("re-offers a stale pending post with no queue job", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;
      const user = yield* createTestUser();

      yield* createTestPost({
        id: "post-1",
        userId: user.id,
        arweaveBlockHeight: null,
        createdAt: staleDate(),
      });

      yield* reconcilePostBlockHeights;

      expect(findQueue(yield* admin.getQueueStats)?.pending).toBe(1);
    }).pipe(Effect.provide(makeTestLayer())),
  );

  it.effect("ignores fresh pending posts", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;
      const user = yield* createTestUser();

      yield* createTestPost({
        id: "post-1",
        userId: user.id,
        arweaveBlockHeight: null,
        createdAt: new Date(),
      });

      yield* reconcilePostBlockHeights;

      expect(yield* admin.getQueueStats).toStrictEqual([]);
    }).pipe(Effect.provide(makeTestLayer())),
  );

  it.effect("does not duplicate an in-flight job", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;
      const user = yield* createTestUser();

      yield* createTestPost({
        id: "post-1",
        userId: user.id,
        arweaveBlockHeight: null,
        createdAt: staleDate(),
      });

      yield* updateArweaveBlockHeightJob.offer(
        { postId: "post-1" },
        { id: blockHeightJobId("post-1") },
      );

      yield* reconcilePostBlockHeights;

      expect(findQueue(yield* admin.getQueueStats)?.pending).toBe(1);
    }).pipe(Effect.provide(makeTestLayer())),
  );

  it.effect("ignores posts whose height is already known", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;
      const user = yield* createTestUser();

      yield* createTestPost({
        id: "post-1",
        userId: user.id,
        arweaveBlockHeight: 42,
        createdAt: staleDate(),
      });

      yield* reconcilePostBlockHeights;

      expect(yield* admin.getQueueStats).toStrictEqual([]);
    }).pipe(Effect.provide(makeTestLayer())),
  );
});
