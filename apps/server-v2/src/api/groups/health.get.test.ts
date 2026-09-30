import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { getHealth } from "@/api/handlers/health";
import { JobAdminService, type JobAdmin } from "@/queue/admin";

const summary = {
  pending: 1,
  active: 2,
  completed: 3,
  failed: 4,
  oldestPendingAgeMillis: 5_000,
};

const TestJobAdminLayer = Layer.succeed(JobAdminService, {
  getSummary: Effect.succeed(summary),
  getQueueStats: Effect.succeed([]),
  listFailed: () => Effect.succeed({ results: [], total: 0 }),
  retryFailedJob: () => Effect.succeed(false),
  deleteFailedJob: () => Effect.succeed(false),
  clearJob: () => Effect.succeed(false),
} satisfies JobAdmin);

describe("health.get", () => {
  it.effect("returns success with the queue summary", () =>
    Effect.gen(function* () {
      const result = yield* getHealth;

      expect(result).toStrictEqual({ success: true, queues: summary });
    }).pipe(Effect.provide(TestJobAdminLayer)),
  );
});
