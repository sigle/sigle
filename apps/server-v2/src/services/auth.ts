import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { eq } from "drizzle-orm";
import { Context, Effect, Layer, Redacted } from "effect";
import { siws } from "sign-in-with-stacks/plugins/better-auth";
import { AppConfig, type AppConfigValues } from "@/config";
import { AuthDatabase, type AuthDatabaseClient } from "@/db";
import * as schema from "@/db/schema";

export const AUTH_COOKIE_PREFIX = "sigle";

export const SESSION_COOKIE_NAME = `${AUTH_COOKIE_PREFIX}.session_token`;

export const createAuth = (config: AppConfigValues, db: AuthDatabaseClient) => {
  const useSecureCookies = config.APP_URL.startsWith("https://");
  const hostname = new URL(config.APP_URL).hostname;
  const rootDomain = hostname.split(".").slice(-2).join(".");

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    secret: Redacted.value(config.AUTH_SECRET),
    appName: "sigle",
    baseURL: config.APP_URL,
    trustedOrigins: [config.APP_URL],
    advanced: {
      cookiePrefix: AUTH_COOKIE_PREFIX,
      useSecureCookies,
      crossSubDomainCookies: {
        enabled: true,
        domain: hostname === "localhost" ? hostname : `.${rootDomain}`,
      },
    },
    databaseHooks: {
      session: {
        create: {
          after: async (session) => {
            await db
              .update(schema.user)
              .set({ lastLoginAt: new Date() })
              .where(eq(schema.user.id, session.userId));
          },
        },
      },
    },
    plugins: [
      siws({
        domain: new URL(config.APP_URL).host,
      }),
    ],
  });
};

export interface AuthSession {
  readonly user: {
    readonly id: string;
  };
}

export interface AuthApi {
  readonly handler: (request: Request) => Effect.Effect<Response>;
  readonly getSession: (headers: Headers) => Effect.Effect<AuthSession | null>;
}

export const makeAuthService = Effect.gen(function* () {
  const config = yield* AppConfig;
  const db = yield* AuthDatabase;
  const auth = createAuth(config, db);

  return {
    handler: (request: Request) => Effect.promise(() => auth.handler(request)),
    getSession: (headers: Headers) =>
      Effect.promise(async () => {
        const session = await auth.api.getSession({ headers });

        return session ? { user: { id: session.user.id } } : null;
      }),
  } satisfies AuthApi;
});

export class AuthService extends Context.Service<AuthService, AuthApi>()(
  "sigle/AuthService",
) {
  static readonly layer: Layer.Layer<
    AuthService,
    never,
    AuthDatabase | AppConfig
  > = Layer.effect(AuthService, makeAuthService);
}
