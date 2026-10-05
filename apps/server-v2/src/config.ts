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
): Config.Config<Option.Option<Redacted.Redacted>> =>
  OptionalNonEmptyString(name).pipe(Config.map(Option.map(Redacted.make)));

const CommaSeparatedList = (
  name: string,
): Config.Config<ReadonlyArray<string>> =>
  Config.String(name).pipe(
    Config.withDefault(""),
    Config.map((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );

export const appConfig = Config.all({
  NODE_ENV: Config.Literals(
    ["production", "development", "test"],
    "NODE_ENV",
  ).pipe(Config.withDefault("development" as const)),
  STACKS_ENV: Config.Literals(["mainnet", "testnet"], "STACKS_ENV"),
  SIGLE_ENV: Config.Literals(["production", "staging", "local"], "SIGLE_ENV"),
  PORT: Config.Port("PORT").pipe(Config.withDefault(3001)),
  AUTH_SECRET: Config.NonEmptyString("AUTH_SECRET").pipe(
    Config.map(Redacted.make),
  ),
  APP_ID: Config.NonEmptyString("APP_ID"),
  APP_URL: Config.NonEmptyString("APP_URL"),
  API_URL: Config.NonEmptyString("API_URL"),
  // Private key used to send transactions on Arweave
  ARWEAVE_PRIVATE_KEY: Config.NonEmptyString("ARWEAVE_PRIVATE_KEY").pipe(
    Config.map(Redacted.make),
  ),
  // The gateway URL to use when serving files stored on Arweave
  ARWEAVE_GATEWAY_URL: Config.NonEmptyString("ARWEAVE_GATEWAY_URL").pipe(
    Config.withDefault("https://turbo-gateway.com"),
  ),
  // The gateway URL to use when serving files stored on IPFS
  IPFS_GATEWAY_URL: Config.NonEmptyString("IPFS_GATEWAY_URL").pipe(
    Config.withDefault("https://ipfs.filebase.io/ipfs"),
  ),
  // The S3-compatible endpoint of the Cloudflare R2 bucket
  R2_ENDPOINT: Config.NonEmptyString("R2_ENDPOINT"),
  // The R2 access key id
  R2_ACCESS_KEY_ID: Config.NonEmptyString("R2_ACCESS_KEY_ID"),
  // The R2 secret access key
  R2_SECRET_ACCESS_KEY: Config.NonEmptyString("R2_SECRET_ACCESS_KEY").pipe(
    Config.map(Redacted.make),
  ),
  // The R2 bucket name
  R2_BUCKET: Config.NonEmptyString("R2_BUCKET"),
  // The public base URL used to serve uploaded files
  R2_PUBLIC_URL: Config.NonEmptyString("R2_PUBLIC_URL"),
  DATABASE_KIND: Config.Literals(["postgres", "pglite"], "DATABASE_KIND"),
  DATABASE_URL: Config.NonEmptyString("DATABASE_URL").pipe(
    Config.map(Redacted.make),
  ),
  SENTRY_DSN: OptionalNonEmptyString("SENTRY_DSN"),
  POSTHOG_API_KEY: OptionalNonEmptyRedacted("POSTHOG_API_KEY"),
  POSTHOG_API_HOST: OptionalNonEmptyString("POSTHOG_API_HOST"),
  // Wallet addresses allowed to access the admin jobs API
  ADMIN_ADDRESSES: CommaSeparatedList("ADMIN_ADDRESSES"),
});

export type AppConfigValues = Config.Success<typeof appConfig>;

export const defaultTestConfig: AppConfigValues = {
  NODE_ENV: "test",
  STACKS_ENV: "testnet",
  SIGLE_ENV: "local",
  PORT: 3001,
  AUTH_SECRET: Redacted.make("sigle-test-auth-secret-change-me"),
  APP_ID: "sigle-test",
  APP_URL: "http://localhost:3000",
  API_URL: "http://localhost:3001",
  ARWEAVE_PRIVATE_KEY: Redacted.make("sigle-test-arweave-private-key"),
  ARWEAVE_GATEWAY_URL: "https://turbo-gateway.com",
  IPFS_GATEWAY_URL: "https://ipfs.filebase.io/ipfs",
  R2_ENDPOINT: "https://r2.test",
  R2_ACCESS_KEY_ID: "r2-test-access-key-id",
  R2_SECRET_ACCESS_KEY: Redacted.make("r2-test-secret-access-key"),
  R2_BUCKET: "sigle-test",
  R2_PUBLIC_URL: "https://cdn.test",
  DATABASE_KIND: "pglite",
  DATABASE_URL: Redacted.make("memory://"),
  SENTRY_DSN: Option.none(),
  POSTHOG_API_KEY: Option.none(),
  POSTHOG_API_HOST: Option.none(),
  ADMIN_ADDRESSES: [],
};

export class AppConfig extends Context.Service<AppConfig, AppConfigValues>()(
  "sigle/AppConfig",
) {
  static readonly layer: Layer.Layer<AppConfig, Config.ConfigError> =
    Layer.effect(AppConfig, appConfig);

  static readonly layerTest = (
    overrides?: Partial<AppConfigValues>,
  ): Layer.Layer<AppConfig> =>
    Layer.succeed(AppConfig, {
      ...defaultTestConfig,
      ...overrides,
    });
}
