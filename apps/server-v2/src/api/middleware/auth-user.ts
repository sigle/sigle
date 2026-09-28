import { Context, Effect, Layer } from "effect";
import { HttpServerRequest } from "effect/unstable/http";
import { HttpApiMiddleware } from "effect/unstable/httpapi";
import { Forbidden, Unauthorized } from "@/api/schemas";
import { AuthService } from "@/services/auth";
import { UserWhitelistService } from "@/services/users";

export interface AuthenticatedUser {
  readonly id: string;
}

export class CurrentUser extends Context.Service<
  CurrentUser,
  AuthenticatedUser
>()("sigle/CurrentUser") {}

export class UserAuthMiddleware extends HttpApiMiddleware.Service<
  UserAuthMiddleware,
  {
    provides: CurrentUser;
    requires: AuthService | UserWhitelistService;
  }
>()("sigle/UserAuthMiddleware", {
  error: [Unauthorized, Forbidden],
}) {}

export const UserAuthMiddlewareLayer: Layer.Layer<
  UserAuthMiddleware,
  never,
  AuthService | UserWhitelistService
> = Layer.effect(
  UserAuthMiddleware,
  Effect.gen(function* () {
    const auth = yield* AuthService;
    const users = yield* UserWhitelistService;

    return (httpEffect) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;
        const headers = new globalThis.Headers(request.headers);

        const session = yield* auth.getSession(headers);

        if (!session) {
          return yield* Effect.fail(
            new Unauthorized({ message: "Unauthorized" }),
          );
        }

        const whitelisted = yield* users.isUserWhitelisted(session.user.id);

        if (!whitelisted) {
          return yield* Effect.fail(
            new Forbidden({ message: "User is not whitelisted" }),
          );
        }

        return yield* Effect.provideService(httpEffect, CurrentUser, {
          id: session.user.id,
        });
      });
  }),
);
