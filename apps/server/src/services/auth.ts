import { STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { eq } from "drizzle-orm";
import { Context, Effect, Layer, Redacted } from "effect";
import { randomBytes } from "node:crypto";
import { verifySiwsMessage } from "sign-in-with-stacks";
import { siws } from "sign-in-with-stacks/plugins/better-auth";
import type { AppConfigValues } from "@/config";
import type { AuthDatabaseClient } from "@/db";
import type { PostHogClient } from "@/services/posthog";
import { AppConfig } from "@/config";
import { AuthDatabase } from "@/db";
import * as schema from "@/db/schema";
import { PostHogService } from "@/services/posthog";

export const AUTH_COOKIE_PREFIX = "sigle";

export const SESSION_COOKIE_NAME = `${AUTH_COOKIE_PREFIX}.session_token`;

/** Session cookie name over HTTPS, where better-auth uses secure cookies. */
export const SECURE_SESSION_COOKIE_NAME = `__Secure-${SESSION_COOKIE_NAME}`;

export const createAuth = (
  config: AppConfigValues,
  db: AuthDatabaseClient,
  posthog: PostHogClient,
) => {
  const useSecureCookies = config.APP_URL.startsWith("https://");
  const hostname = new URL(config.APP_URL).hostname;
  const rootDomain = hostname.split(".").slice(-2).join(".");
  const domain = new URL(config.APP_URL).host;

  const chainId =
    config.STACKS_ENV === "mainnet"
      ? STACKS_MAINNET.chainId
      : STACKS_TESTNET.chainId;

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    secret: Redacted.value(config.AUTH_SECRET),
    appName: "sigle",
    baseURL: config.APP_URL,
    trustedOrigins: [config.APP_URL],
    advanced: {
      // Sessions store no client IP: Sigle doesn't keep IP addresses. Our
      // rate limits on `/api/auth/*` key by IP in memory only.
      ipAddress: { disableIpTracking: true },
      cookiePrefix: AUTH_COOKIE_PREFIX,
      useSecureCookies,
      crossSubDomainCookies: {
        enabled: true,
        domain: hostname === "localhost" ? hostname : `.${rootDomain}`,
      },
    },
    databaseHooks: {
      user: {
        create: {
          // A user is created on the first sign-in of their wallet.
          after: async (createdUser) => {
            await Effect.runPromise(
              posthog.capture({
                distinctId: createdUser.id,
                event: "user_signed_up",
              }),
            );
          },
        },
      },
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
        domain,
        // The plugin's default nonces come from `Math.random`, and each one
        // overlaps the previous one, so they can be predicted. The plugin
        // accepts 8 to 250 alphanumeric characters, hence hex.
        getNonce: async () => randomBytes(32).toString("hex"),
        // The plugin's own verification, for the deployment's network only:
        // it accepts any chain ID, so a testnet server would sign in a
        // mainnet signature as a separate user, and the reverse. The plugin
        // checks and consumes the nonce itself.
        verifyMessage: async (args) =>
          args.chainId === chainId &&
          verifySiwsMessage({
            message: args.message,
            signature: args.signature,
            address: args.address,
            domain,
          }),
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
  const posthog = yield* PostHogService;
  const auth = createAuth(config, db, posthog);

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
    AuthDatabase | AppConfig | PostHogService
  > = Layer.effect(AuthService, makeAuthService);
}
