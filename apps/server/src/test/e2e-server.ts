import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Config, Effect, Layer, Option } from "effect";
import { HttpRouter } from "effect/http";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import type { ArweaveUploadResult } from "@/services/arweave";
import { ApiRoutesLayer } from "@/main";
import { provideTestServices } from "@/test/server";

/**
 * The API for the website's end-to-end tests (`apps/sigle/e2e`): the same
 * composition as the endpoint tests, served on a real port for a browser.
 *
 * Arweave, R2, BNS, OpenTimestamps and PostHog are their test layers, and on
 * testnet the plan check never calls the Stacks API, so nothing leaves the
 * machine. Sessions, signatures, limits and jobs are the real ones. The
 * database is in memory: every start is a fresh one.
 */
const e2eConfig = Config.all({
  PORT: Config.Port("PORT").pipe(Config.withDefault(3101)),
  APP_URL: Config.NonEmptyString("APP_URL").pipe(
    Config.withDefault("http://localhost:3100"),
  ),
  API_URL: Config.NonEmptyString("API_URL").pipe(
    Config.withDefault("http://localhost:3101"),
  ),
});

/**
 * Header the browser tests send their client IP in, see `CLIENT_IP_HEADER`.
 * Every test connects from the same address and would share the per-IP rate
 * limits, such as the 5 sign-ins per minute. Each test sends its own address
 * instead, as the proxy in front of the API does in production.
 */
const E2E_CLIENT_IP_HEADER = "x-e2e-client-ip";

/**
 * Host the website's server reaches the API on, see `RAILWAY_PRIVATE_DOMAIN`
 * and `API_INTERNAL_URL` on the website. Browsers use `localhost`, so only
 * the server-side reads skip the rate limits, as in production.
 */
const E2E_PRIVATE_DOMAIN = "127.0.0.1";

const ARWEAVE_GATEWAY_URL = "https://turbo-gateway.com";

/**
 * A post's id is its Arweave transaction id, so each upload needs its own,
 * shaped like a real one: 32 random bytes in base64url.
 */
const uploadWithUniqueId = Effect.sync((): ArweaveUploadResult => {
  const id = randomBytes(32).toString("base64url");

  return {
    id,
    cid: "bafkreietui4xdkiu4xvmx4fi2jivjtndbhb4drzpxomrjvd4mdz4w2avra",
    uri: `ar://${id}`,
    gatewayUrl: `${ARWEAVE_GATEWAY_URL}/${id}`,
  };
});

const E2eServerLayer = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* e2eConfig;

    return HttpRouter.serve(ApiRoutesLayer).pipe(
      Layer.provide(NodeHttpServer.layer(createServer, { port: config.PORT })),
      provideTestServices(
        {
          ...config,
          ARWEAVE_GATEWAY_URL,
          CLIENT_IP_HEADER: Option.some(E2E_CLIENT_IP_HEADER),
          RAILWAY_PRIVATE_DOMAIN: Option.some(E2E_PRIVATE_DOMAIN),
        },
        [],
        {
          arweaveUploadImpl: () => uploadWithUniqueId,
          pollInterval: "50 millis",
        },
      ),
    );
  }),
);

Layer.launch(E2eServerLayer).pipe(NodeRuntime.runMain);
