import { Effect, Layer } from "effect";
import { HttpApiMiddleware } from "effect/http-api";
import { CurrentUser } from "@/api/middleware/auth-user";
import { Forbidden } from "@/api/schemas";
import { UserWhitelistService } from "@/services/users";

/**
 * Requires the authenticated user to own one of the wallet addresses listed in
 * the `ADMIN_ADDRESSES` configuration. An empty list locks the admin API for
 * everyone.
 */
export class AdminMiddleware extends HttpApiMiddleware.Service<
  AdminMiddleware,
  {
    requires: CurrentUser | UserWhitelistService;
  }
>()("sigle/AdminMiddleware", {
  error: [Forbidden],
}) {}

export const AdminMiddlewareLayer: Layer.Layer<
  AdminMiddleware,
  never,
  UserWhitelistService
> = Layer.effect(
  AdminMiddleware,
  Effect.gen(function* () {
    const users = yield* UserWhitelistService;

    return (httpEffect) =>
      Effect.gen(function* () {
        const user = yield* CurrentUser;
        const isAdmin = yield* users.isUserAdmin(user.id);

        if (!isAdmin) {
          return yield* new Forbidden({ message: "User is not an admin" });
        }

        return yield* httpEffect;
      });
  }),
);
