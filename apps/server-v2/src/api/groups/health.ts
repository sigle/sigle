import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

export const HealthResponse = Schema.Struct({
  success: Schema.Boolean,
});

export const HealthGroup = HttpApiGroup.make("health").add(
  HttpApiEndpoint.get("get", "/health", {
    success: HealthResponse,
  }),
);
