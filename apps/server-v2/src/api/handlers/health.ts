import { Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { SigleApi } from "@/api";
import { JobAdminService, type JobsSummary } from "@/queue/admin";

const EMPTY_QUEUE_SUMMARY: JobsSummary = {
  pending: 0,
  active: 0,
  completed: 0,
  failed: 0,
  oldestPendingAgeMillis: null,
};

export const getHealth = Effect.gen(function* () {
  const admin = yield* JobAdminService;

  // The queue summary is informational: a failing lookup must not turn the
  // liveness probe into a 500.
  const queues = yield* admin.getSummary.pipe(
    Effect.catchCause((cause) =>
      Effect.logWarning(
        "Queue summary unavailable for health check",
        cause,
      ).pipe(Effect.as(EMPTY_QUEUE_SUMMARY)),
    ),
  );

  return {
    success: true,
    queues,
  };
});

export const HealthHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "health",
  (handlers) => handlers.handle("get", () => getHealth),
);
