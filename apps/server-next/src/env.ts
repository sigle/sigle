import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  emptyStringAsUndefined: true,
  // @ts-expect-error types are not properly inferred by nitro
  runtimeEnv: import.meta.env,

  server: {
    NODE_ENV: z.enum(["production", "development"]),
    STACKS_ENV: z.enum(["mainnet", "testnet"]),
    SIGLE_ENV: z.enum(["production", "staging", "local"]),
    APP_ID: z.string(),
    // The URL to the Postgres database
    DATABASE_URL: z.string().url(),
    // The next-auth secret used to verify the user session tokens
    AUTH_SECRET: z.string(),
    // Private key used to send transactions on Arweave
    ARWEAVE_PRIVATE_KEY: z.string(),
    // An internal API token used to authenticate the internal services with the API
    INTERNAL_API_TOKEN: z.string(),
    // The URL to the web application
    APP_URL: z.string().url(),
    // The URL to the API server
    API_URL: z.string().url(),
    // The API key to use to interact with the Hiro Platform API
    HIRO_API_KEY: z.string().optional(),
    // Only used in development, the URL to proxy the various webhooks we receive
    WEBHOOK_PROXY_URL: z.string().url().optional(),
    // The key used to verify the chainhooks bearer token
    CHAINHOOK_API_TOKEN: z.string(),
    SENTRY_DSN: z.string().url().optional(),
    POSTHOG_API_KEY: z.string().optional(),
    POSTHOG_API_HOST: z.string().optional(),
    FILEBASE_ACCESS_KEY: z.string(),
    FILEBASE_SECRET_KEY: z.string(),
    FILEBASE_BUCKET: z.string(),
    IPFS_GATEWAY_URL: z.string().url().optional().default("https://ipfs.io"),
  },
});
