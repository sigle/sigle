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

export const CurrentUserResponse = Schema.Struct({
  id: Schema.String,
  // Primary Stacks address of the user, used to read their public profile and
  // posts.
  address: Schema.String,
  whitelisted: Schema.Boolean,
  plan: Schema.Literals(["free", "pro"]),
  publishLimit: PublishLimit,
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
        "Return the signed-in user's id, primary Stacks address, whitelist status, plan, and daily publish limit. Returns a 401 without a session.",
      ),
  )
  .prefix("/api/me")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
