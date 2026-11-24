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

const StacksEnv = Config.Literals(["mainnet", "testnet"], "STACKS_ENV");

const HIRO_API_URLS = {
  mainnet: "https://api.hiro.so",
  testnet: "https://api.testnet.hiro.so",
} as const;

export const appConfig = Config.all({
  NODE_ENV: Config.Literals(
    ["production", "development", "test"],
    "NODE_ENV",
  ).pipe(Config.withDefault("development" as const)),
  STACKS_ENV: StacksEnv,
  // The Stacks Blockchain API, defaults to Hiro for the STACKS_ENV network
  STACKS_API_URL: Config.NonEmptyString("STACKS_API_URL").pipe(
    Config.orElse(() =>
      StacksEnv.pipe(Config.map((network) => HIRO_API_URLS[network])),
    ),
  ),
  // Hiro API key, sent as the `x-api-key` header to STACKS_API_URL for higher
  // rate limits. Requests are anonymous when unset
  HIRO_API_KEY: OptionalNonEmptyRedacted("HIRO_API_KEY"),
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
  // The SQLite database file, or `:memory:`. Litestream backs up this file
  // when the server runs through `start.sh` with backups configured.
  DATABASE_PATH: Config.NonEmptyString("DATABASE_PATH"),
  // Request header holding the client IP, set by the proxy in front of the
  // API, such as `x-real-ip` on Railway. Only set it when every request goes
  // through that proxy, clients can send any header otherwise. Rate limits
  // fall back to the socket address when unset.
  CLIENT_IP_HEADER: OptionalNonEmptyString("CLIENT_IP_HEADER").pipe(
    Config.map(Option.map((name) => name.toLowerCase())),
  ),
  // This service's name on Railway's private network, such as
  // `sigle.railway.internal`, set by Railway. GET requests addressed to it are
  // not rate limited, see `RateLimitMiddlewareLayer`.
  RAILWAY_PRIVATE_DOMAIN: OptionalNonEmptyString("RAILWAY_PRIVATE_DOMAIN"),
  SENTRY_DSN: OptionalNonEmptyString("SENTRY_DSN"),
  POSTHOG_API_KEY: OptionalNonEmptyRedacted("POSTHOG_API_KEY"),
  POSTHOG_API_HOST: OptionalNonEmptyString("POSTHOG_API_HOST"),
  // Wallet addresses allowed to access the admin jobs API
  ADMIN_ADDRESSES: CommaSeparatedList("ADMIN_ADDRESSES"),
  // Wallet addresses on the pro plan on testnet, where the Explorer Guild NFT
  // is not deployed. Ignored on mainnet
  PRO_ADDRESSES: CommaSeparatedList("PRO_ADDRESSES"),
});

export type AppConfigValues = Config.Success<typeof appConfig>;

export const defaultTestConfig: AppConfigValues = {
  NODE_ENV: "test",
  STACKS_ENV: "testnet",
  STACKS_API_URL: "https://api.testnet.hiro.so",
  HIRO_API_KEY: Option.none(),
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
  DATABASE_PATH: ":memory:",
  CLIENT_IP_HEADER: Option.none(),
  RAILWAY_PRIVATE_DOMAIN: Option.none(),
  SENTRY_DSN: Option.none(),
  POSTHOG_API_KEY: Option.none(),
  POSTHOG_API_HOST: Option.none(),
  ADMIN_ADDRESSES: [],
  PRO_ADDRESSES: [],
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
