import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";
import { UserAuthMiddleware } from "@/api/middleware/auth-user";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";

export const CurrentUserResponse = Schema.Struct({
  id: Schema.String,
  // Primary Stacks address of the user, used to read their public profile and
  // posts.
  address: Schema.String,
  whitelisted: Schema.Boolean,
  plan: Schema.Literals(["free", "pro"]),
}).annotate({ identifier: "CurrentUserResponse" });

export const MeGroup = HttpApiGroup.make("me")
  .annotate(
    OpenApi.Description,
    "The signed-in user, with their whitelist status and plan.",
  )
  .add(
    HttpApiEndpoint.get("get", "/", {
      success: CurrentUserResponse,
    })
      .annotate(OpenApi.Summary, "Get the signed-in user")
      .annotate(
        OpenApi.Description,
        "Return the signed-in user's id, primary Stacks address, whitelist status, and plan. Returns a 401 without a session.",
      ),
  )
  .prefix("/api/me")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
