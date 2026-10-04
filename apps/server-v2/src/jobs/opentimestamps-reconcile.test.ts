import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Schedule } from "effect";
import { makeQueuesTestLayer } from "@/jobs";
import { JobAdminService, type QueueStats } from "@/queue/admin";
import { ArweaveService } from "@/services/arweave";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import {
  createTestPost,
  createTestPostOts,
  createTestUser,
} from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";
import { reconcileOpenTimestamps } from "./opentimestamps-reconcile";
import { opentimestampsStampJob, otsStampJobId } from "./opentimestamps-stamp";

const makeReconcileTestLayer = () =>
  makeQueuesTestLayer({
    enableWorkers: false,
    maxAttempts: 2,
    retrySchedule: Schedule.spaced("0 millis"),
  }).pipe(
    Layer.provideMerge(OpenTimestampsService.layerTest()),
    Layer.provideMerge(ArweaveService.layerTest()),
    Layer.provideMerge(PostHogService.layerTest()),
    Layer.provideMerge(TestDatabaseLayer),
  );

const staleDate = () => new Date(Date.now() - 16 * 60 * 1000);

const findStampQueue = (stats: ReadonlyArray<QueueStats>) =>
  stats.find((queue) => queue.queueName === opentimestampsStampJob.name);

const seedStalePendingRow = (postId: string) =>
  Effect.gen(function* () {
    const user = yield* createTestUser();

    yield* createTestPost({ id: postId, userId: user.id });
    yield* createTestPostOts({
      postId,
      status: "PENDING",
      pendingProof: null,
      updatedAt: staleDate(),
    });
  });

describe("opentimestamps reconciliation", () => {
  it.effect("re-offers a stale pending proof with no queue job", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;

      yield* seedStalePendingRow("post-lost");
      yield* reconcileOpenTimestamps;

      const stampQueue = findStampQueue(yield* admin.getQueueStats);

      expect(stampQueue?.pending).toBe(1);
    }).pipe(Effect.provide(makeReconcileTestLayer())),
  );

  it.effect("ignores fresh pending proofs", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;
      const user = yield* createTestUser();

      yield* createTestPost({ id: "post-fresh", userId: user.id });
      yield* createTestPostOts({
        postId: "post-fresh",
        pendingProof: null,
        updatedAt: new Date(),
      });

      yield* reconcileOpenTimestamps;

      expect(yield* admin.getQueueStats).toStrictEqual([]);
    }).pipe(Effect.provide(makeReconcileTestLayer())),
  );

  it.effect("does not duplicate an in-flight stamp job", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;

      yield* seedStalePendingRow("post-in-flight");

      yield* opentimestampsStampJob.offer(
        { postId: "post-in-flight" },
        { id: otsStampJobId("post-in-flight") },
      );

      yield* reconcileOpenTimestamps;

      const stampQueue = findStampQueue(yield* admin.getQueueStats);

      expect(stampQueue?.pending).toBe(1);
    }).pipe(Effect.provide(makeReconcileTestLayer())),
  );

  it.effect("ignores pending proofs that already have a proof", () =>
    Effect.gen(function* () {
      const admin = yield* JobAdminService;
      const user = yield* createTestUser();

      yield* createTestPost({ id: "post-has-proof", userId: user.id });
      yield* createTestPostOts({
        postId: "post-has-proof",
        pendingProof: Buffer.from("proof"),
        updatedAt: staleDate(),
      });

      yield* reconcileOpenTimestamps;

      expect(yield* admin.getQueueStats).toStrictEqual([]);
    }).pipe(Effect.provide(makeReconcileTestLayer())),
  );
});
