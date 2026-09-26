import { Config, Context, Layer, Option, Redacted } from "effect";

const OptionalNonEmptyString = (
  name: string,
): Config.Config<Option.Option<string>> =>
  Config.String(name).pipe(
    Config.withDefault(""),
    Config.map((value) =>
      value.length > 0 ? Option.some(value) : Option.none(),
    ),
  );

const OptionalNonEmptyRedacted = (
  name: string,
): Config.Config<Option.Option<Redacted.Redacted<string>>> =>
  OptionalNonEmptyString(name).pipe(Config.map(Option.map(Redacted.make)));

export const appConfig = Config.all({
  NODE_ENV: Config.Literals(
    ["production", "development", "test"],
    "NODE_ENV",
  ).pipe(Config.withDefault("development" as const)),
  STACKS_ENV: Config.Literals(["mainnet", "testnet"], "STACKS_ENV"),
  SIGLE_ENV: Config.Literals(["production", "staging", "local"], "SIGLE_ENV"),
  PORT: Config.Port("PORT").pipe(Config.withDefault(3001)),
  APP_ID: Config.NonEmptyString("APP_ID"),
  APP_URL: Config.NonEmptyString("APP_URL"),
  API_URL: Config.NonEmptyString("API_URL"),
  SENTRY_DSN: OptionalNonEmptyString("SENTRY_DSN"),
  POSTHOG_API_KEY: OptionalNonEmptyRedacted("POSTHOG_API_KEY"),
  POSTHOG_API_HOST: OptionalNonEmptyString("POSTHOG_API_HOST"),
});

export type AppConfigShape = Config.Success<typeof appConfig>;

export const defaultTestConfig: AppConfigShape = {
  NODE_ENV: "test",
  STACKS_ENV: "testnet",
  SIGLE_ENV: "local",
  PORT: 3001,
  APP_ID: "sigle-test",
  APP_URL: "http://localhost:3000",
  API_URL: "http://localhost:3001",
  SENTRY_DSN: Option.none(),
  POSTHOG_API_KEY: Option.none(),
  POSTHOG_API_HOST: Option.none(),
};

export class AppConfig extends Context.Service<AppConfig, AppConfigShape>()(
  "sigle/AppConfig",
) {
  static readonly layer: Layer.Layer<AppConfig, Config.ConfigError> =
    Layer.effect(AppConfig, appConfig);

  static readonly layerTest = (
    overrides?: Partial<AppConfigShape>,
  ): Layer.Layer<AppConfig> =>
    Layer.succeed(AppConfig, {
      ...defaultTestConfig,
      ...overrides,
    });
}
