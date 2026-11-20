import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";

export const HealthResponse = Schema.Struct({
  success: Schema.Boolean,
}).annotate({ identifier: "HealthResponse" });

export const HealthGroup = HttpApiGroup.make("health")
  .annotate(OpenApi.Description, "Liveness check of the API.")
  .add(
    HttpApiEndpoint.get("get", "/health", {
      success: HealthResponse,
    })
      .annotate(OpenApi.Summary, "Check the API health")
      .annotate(
        OpenApi.Description,
        "Return `{ success: true }` while the API is up. Used by uptime monitoring.",
      ),
  )
  .middleware(RateLimitMiddleware);
