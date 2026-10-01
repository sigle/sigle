import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/http-api";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";

export const QueueHealthSummary = Schema.Struct({
  pending: Schema.Int,
  active: Schema.Int,
  completed: Schema.Int,
  failed: Schema.Int,
  oldestPendingAgeMillis: Schema.NullOr(Schema.Int),
});

export const HealthResponse = Schema.Struct({
  success: Schema.Boolean,
  queues: QueueHealthSummary,
});

export const HealthGroup = HttpApiGroup.make("health")
  .add(
    HttpApiEndpoint.get("get", "/health", {
      success: HealthResponse,
    }),
  )
  .middleware(RateLimitMiddleware);
