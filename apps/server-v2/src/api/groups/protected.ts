import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";
import { UserAuthMiddleware } from "@/api/middleware/auth-user";

export const CurrentUserResponse = Schema.Struct({
  id: Schema.String,
  whitelisted: Schema.Boolean,
});

export const ProtectedGroup = HttpApiGroup.make("protected")
  .add(
    HttpApiEndpoint.get("me", "/me", {
      success: CurrentUserResponse,
    }),
  )
  .prefix("/api/protected")
  .middleware(UserAuthMiddleware);
