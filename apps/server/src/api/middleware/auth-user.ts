import { Context, Effect, Layer } from "effect";
import { HttpServerRequest } from "effect/http";
import { HttpApiMiddleware, HttpApiSecurity, OpenApi } from "effect/http-api";
import { Forbidden, Unauthorized } from "@/api/schemas";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import {
  AuthService,
  SECURE_SESSION_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/services/auth";
import { findWalletAddresses } from "@/services/users";

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

/**
 * Session cookie set by signing in, documented in the OpenAPI spec so its
 * clients can tell authenticated routes from public ones.
 */
const sessionCookie = HttpApiSecurity.apiKey({
  key: SECURE_SESSION_COOKIE_NAME,
  in: "cookie",
}).pipe(
  HttpApiSecurity.annotate(
    OpenApi.Description,
    `Session cookie set by signing in with Stacks. It is named \`${SESSION_COOKIE_NAME}\` when the API is served over plain HTTP, such as in local development.`,
  ),
);

export class UserAuthMiddleware extends HttpApiMiddleware.Service<
  UserAuthMiddleware,
  {
    provides: CurrentUser;
    requires: AuthService | AppConfig | Database;
  }
>()("sigle/UserAuthMiddleware", {
  error: [Unauthorized],
  security: { sessionCookie },
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

    return {
      // The decoded cookie is unused: better-auth reads and verifies the
      // signed session cookie itself, under its plain or `__Secure-` name.
      sessionCookie: (httpEffect) =>
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
                config.WHITELISTED_ADDRESSES.includes(address),
              ),
          });
        }),
    };
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
