import { describe, expect, it } from "@effect/vitest";
import { ConfigProvider, Effect, Option, Redacted } from "effect";
import { AppConfig } from "@/config";

describe("config service", () => {
  it.effect("loads valid configuration and redacts secrets", () =>
    Effect.gen(function* () {
      const config = yield* AppConfig;

      expect({
        NODE_ENV: config.NODE_ENV,
        STACKS_ENV: config.STACKS_ENV,
        SIGLE_ENV: config.SIGLE_ENV,
        PORT: config.PORT,
        APP_ID: config.APP_ID,
        APP_URL: config.APP_URL,
        API_URL: config.API_URL,
      }).toStrictEqual({
        NODE_ENV: "development",
        STACKS_ENV: "testnet",
        SIGLE_ENV: "local",
        PORT: 3001,
        APP_ID: "sigle-test",
        APP_URL: "http://localhost:3000",
        API_URL: "http://localhost:3001",
      });

      // Secrets must be wrapped in Redacted and hide values when stringified
      const posthogKey = Option.getOrThrow(config.POSTHOG_API_KEY);
      expect({
        redactedKey: String(posthogKey),
        revealedKey: Redacted.value(posthogKey),
        sentry: Option.isNone(config.SENTRY_DSN),
        posthogHost: Option.isNone(config.POSTHOG_API_HOST),
      }).toStrictEqual({
        redactedKey: "<redacted>",
        revealedKey: "phc_secret_key",
        sentry: true,
        posthogHost: true,
      });
    }).pipe(
      Effect.provide(AppConfig.layer),
      Effect.provide(
        ConfigProvider.layer(
          ConfigProvider.fromUnknown({
            STACKS_ENV: "testnet",
            SIGLE_ENV: "local",
            APP_ID: "sigle-test",
            APP_URL: "http://localhost:3000",
            API_URL: "http://localhost:3001",
            POSTHOG_API_KEY: "phc_secret_key",
            POSTHOG_API_HOST: "",
          }),
        ),
      ),
    ),
  );

  it.effect("fails with ConfigError when required variables are missing", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(
        Effect.gen(function* () {
          return yield* AppConfig;
        }).pipe(
          Effect.provide(AppConfig.layer),
          Effect.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))),
        ),
      );

      expect(exit._tag).toBe("Failure");
    }),
  );

  it.effect("provides test layer with overrides", () =>
    Effect.gen(function* () {
      const config = yield* AppConfig;
      expect(config.APP_ID).toBe("custom-app-id");
      expect(config.NODE_ENV).toBe("test");
    }).pipe(
      Effect.provide(
        AppConfig.layerTest({
          APP_ID: "custom-app-id",
        }),
      ),
    ),
  );
});
