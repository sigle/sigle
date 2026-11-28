import { eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { HttpServerRequest } from "effect/http";
import { HttpApiMiddleware, HttpApiSecurity, OpenApi } from "effect/http-api";
import type { UserPlan } from "@/services/plan";
import { Unauthorized } from "@/api/schemas";
import { Database } from "@/db";
import { user } from "@/db/schema";
import { AuthService, SECURE_SESSION_COOKIE_NAME } from "@/services/auth";
import { findWalletAddresses } from "@/services/users";

export interface AuthenticatedUser {
  readonly id: string;
  /** Primary Stacks address of the user. */
  readonly address: string;
  /** Addresses of all the user's wallets, the primary one first. */
  readonly walletAddresses: ReadonlyArray<string>;
  /** The plan stored on the user, see `PlanClient.checkUserPlan`. */
  readonly plan: UserPlan;
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
    "Session cookie issued by `POST /api/auth/siws/verify` after signing in with Stacks.",
  ),
);

export class UserAuthMiddleware extends HttpApiMiddleware.Service<
  UserAuthMiddleware,
  {
    provides: CurrentUser;
    requires: AuthService | Database;
  }
>()("sigle/UserAuthMiddleware", {
  error: [Unauthorized],
  security: { sessionCookie },
}) {}

export const UserAuthMiddlewareLayer: Layer.Layer<
  UserAuthMiddleware,
  never,
  AuthService | Database
> = Layer.effect(
  UserAuthMiddleware,
  Effect.gen(function* () {
    const auth = yield* AuthService;
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

          const [{ plan } = { plan: "free" as const }] = yield* db
            .select({ plan: user.plan })
            .from(user)
            .where(eq(user.id, session.user.id))
            .pipe(Effect.orDie);

          return yield* Effect.provideService(httpEffect, CurrentUser, {
            id: session.user.id,
            address: walletAddresses[0],
            walletAddresses,
            plan,
          });
        }),
    };
  }),
);
