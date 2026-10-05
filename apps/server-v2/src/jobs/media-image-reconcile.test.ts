import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Schedule } from "effect";
import { AppConfig } from "@/config";
import { makeQueuesTestLayer } from "@/jobs";
import { JobAdminService, type QueueStats } from "@/queue/admin";
import { ArweaveService } from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import { createTestMediaImage } from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";
import {
  generateImageThumbhashJob,
  thumbhashJobId,
} from "./generate-image-thumbhash";
import { reconcileMediaImages } from "./media-image-reconcile";

const makeReconcileTestLayer = () =>
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

const findThumbhashQueue = (stats: ReadonlyArray<QueueStats>) =>
  stats.find((queue) => queue.queueName === generateImageThumbhashJob.name);

describe("media image reconciliation", () => {
  it.effect("re-offers a stale pending image with no queue job", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;

      yield* createTestMediaImage({
        id: "https://cdn.test/lost.png",
        updatedAt: staleDate(),
      });

      yield* reconcileMediaImages;

      const queue = findThumbhashQueue(yield* admin.getQueueStats);

      expect(queue?.pending).toBe(1);
    }).pipe(Effect.provide(makeReconcileTestLayer())),
  );

  it.effect("ignores fresh pending images", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;

      yield* createTestMediaImage({
        id: "https://cdn.test/fresh.png",
        updatedAt: new Date(),
      });

      yield* reconcileMediaImages;

      expect(yield* admin.getQueueStats).toStrictEqual([]);
    }).pipe(Effect.provide(makeReconcileTestLayer())),
  );

  it.effect("does not duplicate an in-flight thumbhash job", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;

      yield* createTestMediaImage({
        id: "https://cdn.test/in-flight.png",
        updatedAt: staleDate(),
      });

      yield* generateImageThumbhashJob.offer(
        { imageId: "https://cdn.test/in-flight.png" },
        { id: thumbhashJobId("https://cdn.test/in-flight.png") },
      );

      yield* reconcileMediaImages;

      const queue = findThumbhashQueue(yield* admin.getQueueStats);

      expect(queue?.pending).toBe(1);
    }).pipe(Effect.provide(makeReconcileTestLayer())),
  );

  it.effect("ignores rows that are not pending", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;

      yield* createTestMediaImage({
        id: "https://cdn.test/ready.png",
        status: "READY",
        thumbhash: "a".repeat(34),
        updatedAt: staleDate(),
      });

      yield* createTestMediaImage({
        id: "https://cdn.test/failed.png",
        status: "FAILED",
        updatedAt: staleDate(),
      });

      yield* reconcileMediaImages;

      expect(yield* admin.getQueueStats).toStrictEqual([]);
    }).pipe(Effect.provide(makeReconcileTestLayer())),
  );
});
