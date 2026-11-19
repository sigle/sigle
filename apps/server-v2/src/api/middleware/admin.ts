import { Effect, Layer } from "effect";
import { HttpApiMiddleware } from "effect/http-api";
import { CurrentUser } from "@/api/middleware/auth-user";
import { Forbidden } from "@/api/schemas";
import { AppConfig } from "@/config";

/**
 * Requires the authenticated user to own one of the wallet addresses listed in
 * the `ADMIN_ADDRESSES` configuration. An empty list locks the admin API for
 * everyone.
 */
export class AdminMiddleware extends HttpApiMiddleware.Service<
  AdminMiddleware,
  {
    requires: CurrentUser | AppConfig;
  }
>()("sigle/AdminMiddleware", {
  error: [Forbidden],
}) {}

export const AdminMiddlewareLayer: Layer.Layer<
  AdminMiddleware,
  never,
  AppConfig
> = Layer.effect(
  AdminMiddleware,
  Effect.gen(function* () {
    const config = yield* AppConfig;

    return (httpEffect) =>
      Effect.gen(function* () {
        const user = yield* CurrentUser;

        const isAdmin = user.walletAddresses.some((address) =>
          config.ADMIN_ADDRESSES.includes(address),
        );

        if (!isAdmin) {
          return yield* new Forbidden({ message: "User is not an admin" });
        }

        return yield* httpEffect;
      });
  }),
);
