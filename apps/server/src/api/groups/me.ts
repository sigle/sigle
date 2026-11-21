import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";
import { UserAuthMiddleware } from "@/api/middleware/auth-user";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";
import { DateTime, NonNegativeInt } from "@/api/schemas";

export const DailyLimit = Schema.Struct({
  // Actions allowed per rolling 24 hours.
  limit: NonNegativeInt,
  // Actions counted in the last 24 hours.
  used: NonNegativeInt,
  // When the oldest counted action stops counting, null when none.
  resetsAt: Schema.NullOr(DateTime),
}).annotate({ identifier: "DailyLimit" });

export const UserLimitsResponse = Schema.Struct({
  // Posts published, and publishes in flight.
  publish: DailyLimit,
  // Successful profile updates, across all the user's addresses.
  profileUpdate: DailyLimit,
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
        "Return the limits of the signed-in user's plan and how much of them is used, such as the posts they can still publish and the profile updates they can still make in the last 24 hours. Returns a 401 without a session.",
      ),
  )
  .prefix("/api/me")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
