import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  emptyStringAsUndefined: true,
  // @ts-expect-error types are not properly inferred by nitro
  runtimeEnv: import.meta.env,

  server: {
    NODE_ENV: z.enum(["production", "development", "test"]),
    STACKS_ENV: z.enum(["mainnet", "testnet"]),
    SIGLE_ENV: z.enum(["production", "staging", "local"]),
    APP_ID: z.string(),
    // The URL to the Postgres database
    DATABASE_URL: z.url(),
    // The next-auth secret used to verify the user session tokens
    AUTH_SECRET: z.string(),
    // Private key used to send transactions on Arweave
    ARWEAVE_PRIVATE_KEY: z.string(),
    // An internal API token used to authenticate the internal services with the API
    INTERNAL_API_TOKEN: z.string(),
    // The URL to the web application
    APP_URL: z.url(),
    // The URL to the API server
    API_URL: z.url(),
    // The API key to use to interact with the Hiro Platform API
    HIRO_API_KEY: z.string().optional(),
    // Only used in development, the URL to proxy the various webhooks we receive
    WEBHOOK_PROXY_URL: z.url().optional(),
    // The key used to verify the chainhooks bearer token
    CHAINHOOK_API_TOKEN: z.string(),
    // The gateway URL to use when serving files stored on Arweave
    ARWEAVE_GATEWAY_URL: z.url().default("https://turbo-gateway.com"),
    SENTRY_DSN: z.url().optional(),
    POSTHOG_API_KEY: z.string().optional(),
    POSTHOG_API_HOST: z.string().optional(),
    // The S3-compatible endpoint for IPFS storage (e.g. https://s3.filebase.com)
    S3_ENDPOINT: z.string(),
    // The S3 region (e.g. us-east-1)
    S3_REGION: z.string(),
    // The S3 access key ID
    S3_ACCESS_KEY_ID: z.string(),
    // The S3 secret access key
    S3_SECRET_ACCESS_KEY: z.string(),
    // The S3 bucket name
    S3_BUCKET: z.string(),
    // The IPFS gateway URL to use when serving files (e.g. https://ipfs.filebase.io/ipfs)
    S3_IPFS_GATEWAY_URL: z.url().default("https://ipfs.filebase.io/ipfs"),
  },
});
