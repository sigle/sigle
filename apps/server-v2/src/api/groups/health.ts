import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";

export const HealthResponse = Schema.Struct({
  success: Schema.Boolean,
});

export const HealthGroup = HttpApiGroup.make("health")
  .annotate(OpenApi.Description, "Liveness check of the API.")
  .add(
    HttpApiEndpoint.get("get", "/health", {
      success: HealthResponse,
    }),
  )
  .middleware(RateLimitMiddleware);
