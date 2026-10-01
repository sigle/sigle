import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { getHealth } from "@/api/handlers/health";
import { JobAdminService, type JobAdmin } from "@/queue/admin";

const summary = {
  pending: 1,
  active: 2,
  completed: 3,
  failed: 4,
  oldestPendingAgeMillis: 5_000,
};

const stubJobAdmin = (overrides: Partial<JobAdmin> = {}): JobAdmin => ({
  getSummary: Effect.succeed(summary),
  getQueueStats: Effect.succeed([]),
  listFailed: () => Effect.succeed({ results: [], total: 0 }),
  retryFailedJob: () => Effect.succeed(false),
  deleteFailedJob: () => Effect.succeed(false),
  clearJob: () => Effect.succeed(false),
  ...overrides,
});

describe("health.get", () => {
  it.effect("returns success with the queue summary", () =>
    Effect.gen(function* () {
      const result = yield* getHealth;

      expect(result).toStrictEqual({ success: true, queues: summary });
    }).pipe(Effect.provideService(JobAdminService, stubJobAdmin())),
  );

  it.effect("falls back to an empty summary when the queue lookup fails", () =>
    Effect.gen(function* () {
      const result = yield* getHealth;

      expect(result).toStrictEqual({
        success: true,
        queues: {
          pending: 0,
          active: 0,
          completed: 0,
          failed: 0,
          oldestPendingAgeMillis: null,
        },
      });
    }).pipe(
      Effect.provideService(
        JobAdminService,
        stubJobAdmin({
          getSummary: Effect.die(new Error("database unavailable")),
        }),
      ),
    ),
  );
});
