import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";

export const HealthResponse = Schema.Struct({
  success: Schema.Boolean,
}).annotate({ identifier: "HealthResponse" });

// Not rate limited: load balancer and uptime probes must not get a 429, nor
// fail while the rate limit store, the database, is unavailable.
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
  );
