import { Context, Effect, Layer } from "effect";
import { HttpServerRequest } from "effect/http";
import { HttpApiMiddleware } from "effect/http-api";
import { Forbidden, Unauthorized } from "@/api/schemas";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { AuthService } from "@/services/auth";
import { findWalletAddresses } from "@/services/users";

const WHITELISTED_ADDRESSES: ReadonlyArray<string> = [];

export interface AuthenticatedUser {
  readonly id: string;
  /** Primary Stacks address of the user. */
  readonly address: string;
  /** Addresses of all the user's wallets, the primary one first. */
  readonly walletAddresses: ReadonlyArray<string>;
  readonly whitelisted: boolean;
}

export class CurrentUser extends Context.Service<
  CurrentUser,
  AuthenticatedUser
>()("sigle/CurrentUser") {}

export class UserAuthMiddleware extends HttpApiMiddleware.Service<
  UserAuthMiddleware,
  {
    provides: CurrentUser;
    requires: AuthService | AppConfig | Database;
  }
>()("sigle/UserAuthMiddleware", {
  error: [Unauthorized],
}) {}

export const UserAuthMiddlewareLayer: Layer.Layer<
  UserAuthMiddleware,
  never,
  AuthService | AppConfig | Database
> = Layer.effect(
  UserAuthMiddleware,
  Effect.gen(function* () {
    const auth = yield* AuthService;
    const config = yield* AppConfig;
    const db = yield* Database;

    return (httpEffect) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;
        const headers = new globalThis.Headers(request.headers);

        const session = yield* auth.getSession(headers);

        if (!session) {
          return yield* new Unauthorized({ message: "Unauthorized" });
        }

        const walletAddresses = yield* findWalletAddresses(
          session.user.id,
        ).pipe(Effect.provideService(Database, db));

        return yield* Effect.provideService(httpEffect, CurrentUser, {
          id: session.user.id,
          address: walletAddresses[0],
          walletAddresses,
          whitelisted:
            config.STACKS_ENV === "testnet" ||
            walletAddresses.some((address) =>
              WHITELISTED_ADDRESSES.includes(address),
            ),
        });
      });
  }),
);

export class WhitelistedUserMiddleware extends HttpApiMiddleware.Service<
  WhitelistedUserMiddleware,
  {
    requires: CurrentUser;
  }
>()("sigle/WhitelistedUserMiddleware", {
  error: [Forbidden],
}) {}

export const WhitelistedUserMiddlewareLayer: Layer.Layer<WhitelistedUserMiddleware> =
  Layer.succeed(WhitelistedUserMiddleware, (httpEffect) =>
    Effect.gen(function* () {
      const user = yield* CurrentUser;

      if (!user.whitelisted) {
        return yield* new Forbidden({ message: "User is not whitelisted" });
      }

      return yield* httpEffect;
    }),
  );
