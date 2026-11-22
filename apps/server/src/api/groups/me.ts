import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";
import { UserAuthMiddleware } from "@/api/middleware/auth-user";
import {
  RateLimitMiddleware,
  RateLimitPolicy,
} from "@/api/middleware/rate-limit";
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

const UserPlan = Schema.Literals(["free", "pro"]);

export const CurrentUserResponse = Schema.Struct({
  id: Schema.String,
  // Primary Stacks address of the user, used to read their public profile and
  // posts.
  address: Schema.String,
  whitelisted: Schema.Boolean,
  plan: UserPlan,
}).annotate({ identifier: "CurrentUserResponse" });

export const UserPlanResponse = Schema.Struct({
  plan: UserPlan,
}).annotate({ identifier: "UserPlanResponse" });

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
    HttpApiEndpoint.post("refreshPlan", "/plan/refresh", {
      success: UserPlanResponse,
    })
      .annotate(OpenApi.Summary, "Refresh the signed-in user's plan")
      .annotate(
        OpenApi.Description,
        "Check right away whether one of the signed-in user's wallets holds an Explorer Guild NFT, such as after buying one, instead of waiting for the cached plan to expire. Return the plan the user is now on. Returns a 500 when the Stacks API cannot be reached, and a 401 without a session.",
      )
      .annotate(RateLimitPolicy, "planRefresh"),
  )
  .prefix("/api/me")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
