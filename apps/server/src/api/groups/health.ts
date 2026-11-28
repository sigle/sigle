import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";

export const HealthResponse = Schema.Struct({
  success: Schema.Boolean.annotate({
    description:
      "Always `true` when the API process is ready to serve traffic.",
  }),
}).annotate({
  identifier: "HealthResponse",
  description: "Service liveness response.",
});

// Not rate limited: load balancer and uptime probes must not get a 429, nor
// fail while the rate limit store, the database, is unavailable.
export const HealthGroup = HttpApiGroup.make("health")
  .annotate(OpenApi.Title, "Health")
  .annotate(
    OpenApi.Description,
    "Service liveness probe for uptime checks and load balancers.",
  )
  .add(
    HttpApiEndpoint.get("get", "/health", {
      success: HealthResponse,
    })
      .annotate(OpenApi.Summary, "Health check")
      .annotate(
        OpenApi.Description,
        "Lightweight liveness probe returning `200 OK` while the API is reachable. Exempt from rate limiting.",
      ),
  );
