import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Config, Effect, Layer, Option } from "effect";
import { HttpRouter, HttpServerResponse } from "effect/http";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import type { ArweaveUploadResult } from "@/services/arweave";
import { ApiRoutesLayer } from "@/main";
import { makeStorageTestRecorder, StorageService } from "@/services/storage";
import { provideTestServices } from "@/test/server";

/**
 * The API for the website's end-to-end tests (`apps/sigle/e2e`): the same
 * composition as the endpoint tests, served on a real port for a browser.
 *
 * Arweave, R2, BNS, OpenTimestamps and PostHog are their test layers, and on
 * testnet the plan check never calls the Stacks API, so nothing leaves the
 * machine. Sessions, signatures, limits and jobs are the real ones. The
 * database is in memory, and so are the uploaded files, which this server
 * serves itself: every start is a fresh one.
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

/** Path the uploaded files are served under, as the R2 public URL serves them. */
const STORAGE_PATH = "/e2e/storage";

const uploadedFiles = makeStorageTestRecorder();

/** Serves the last file uploaded under a key, as the CDN does in production. */
const StorageRoutesLayer = HttpRouter.add(
  "GET",
  `${STORAGE_PATH}/*`,
  (request) =>
    Effect.sync(() => {
      const key = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname.slice(
          STORAGE_PATH.length + 1,
        ),
      );

      const file = uploadedFiles.uploads.findLast(
        (upload) => upload.key === key,
      );

      return file === undefined || uploadedFiles.deletes.includes(key)
        ? HttpServerResponse.empty({ status: 404 })
        : HttpServerResponse.uint8Array(file.body, {
            contentType: file.contentType,
          });
    }),
);

const E2eServerLayer = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* e2eConfig;

    const storageUrl = `${config.API_URL}${STORAGE_PATH}`;

    return HttpRouter.serve(
      Layer.mergeAll(ApiRoutesLayer, StorageRoutesLayer),
    ).pipe(
      Layer.provide(NodeHttpServer.layer(createServer, { port: config.PORT })),
      provideTestServices(
        {
          ...config,
          ARWEAVE_GATEWAY_URL,
          R2_PUBLIC_URL: storageUrl,
          CLIENT_IP_HEADER: Option.some(E2E_CLIENT_IP_HEADER),
          RAILWAY_PRIVATE_DOMAIN: Option.some(E2E_PRIVATE_DOMAIN),
        },
        [],
        {
          arweaveUploadImpl: () => uploadWithUniqueId,
          pollInterval: "50 millis",
          storage: StorageService.layerTest(uploadedFiles, {
            uploadFile: ({ key, version }) =>
              Effect.succeed({ key, url: `${storageUrl}/${key}`, version }),
          }),
        },
      ),
    );
  }),
);

Layer.launch(E2eServerLayer).pipe(NodeRuntime.runMain);
