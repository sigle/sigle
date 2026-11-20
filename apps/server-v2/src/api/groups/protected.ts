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
});

export const ProtectedGroup = HttpApiGroup.make("protected")
  .annotate(
    OpenApi.Description,
    "The signed-in user, with their whitelist status and plan.",
  )
  .add(
    HttpApiEndpoint.get("me", "/me", {
      success: CurrentUserResponse,
    }),
  )
  .prefix("/api/protected")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
