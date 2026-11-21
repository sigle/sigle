import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";
import { UserAuthMiddleware } from "@/api/middleware/auth-user";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";
import { DateTime, NonNegativeInt } from "@/api/schemas";

export const PublishLimit = Schema.Struct({
  // Posts the plan allows per rolling 24 hours.
  limit: NonNegativeInt,
  // Posts published in the last 24 hours, and publishes in flight.
  used: NonNegativeInt,
  // When the oldest counted publish stops counting, null when none.
  resetsAt: Schema.NullOr(DateTime),
}).annotate({ identifier: "PublishLimit" });

export const UserLimitsResponse = Schema.Struct({
  publish: PublishLimit,
}).annotate({ identifier: "UserLimitsResponse" });

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
    "The signed-in user, with their whitelist status, plan, and limits.",
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
    HttpApiEndpoint.get("limits", "/limits", {
      success: UserLimitsResponse,
    })
      .annotate(OpenApi.Summary, "Get the signed-in user's limits")
      .annotate(
        OpenApi.Description,
        "Return the limits of the signed-in user's plan and how much of them is used, such as the posts they can still publish in the last 24 hours. Returns a 401 without a session.",
      ),
  )
  .prefix("/api/me")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
