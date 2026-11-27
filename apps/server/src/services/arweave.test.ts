import { describe, expect, it } from "@effect/vitest";
import { Effect, Fiber, Layer, Predicate } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import { TestClock } from "effect/testing";
import type {
  ArweaveBlockHeightsResponse,
  ArweaveTag,
  ArweaveUploader,
} from "@/services/arweave";
import { AppConfig } from "@/config";
import {
  ArweaveService,
  ArweaveUploadError,
  makeArweaveService,
  UPLOAD_TIMEOUT,
} from "@/services/arweave";

const unusedUploader: ArweaveUploader = {
  uploadFile: async () => ({ id: "unused" }),
};

interface GatewayRequest {
  readonly url: string;
  readonly body: unknown;
}

/** HTTP client answering every gateway request with `body`. */
const makeGatewayLayer = (
  body: ArweaveBlockHeightsResponse,
  requests: Array<GatewayRequest> = [],
) =>
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request, url) =>
      Effect.sync(() => {
        requests.push({
          url: url.toString(),
          body: Predicate.isTagged(request.body, "Uint8Array")
            ? JSON.parse(new TextDecoder().decode(request.body.body))
            : null,
        });

        return HttpClientResponse.fromWeb(request, Response.json(body));
      }),
    ),
  );

const TEST_FILE = Buffer.from(JSON.stringify({ hello: "world" }));

const TEST_FILE_CID =
  "bafkreietui4xdkiu4xvmx4fi2jivjtndbhb4drzpxomrjvd4mdz4w2avra";

const makeTestArweaveLayer = (
  uploader: ArweaveUploader,
  gateway: Layer.Layer<HttpClient.HttpClient> = makeGatewayLayer({}),
): Layer.Layer<ArweaveService> =>
  Layer.effect(ArweaveService, makeArweaveService(uploader)).pipe(
    Layer.provide(gateway),
    Layer.provide(
      AppConfig.layerTest({
        APP_ID: "Sigle-Test",
        ARWEAVE_GATEWAY_URL: "https://turbo-gateway.test/",
      }),
    ),
  );

describe("arweave service", () => {
  it.effect("gives up and aborts an upload after the upload timeout", () => {
    let aborted = false;

    const uploader: ArweaveUploader = {
      // Like turbo, a hung upload only settles once aborted.
      uploadFile: ({ signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => {
            aborted = true;
            reject(signal.reason);
          });
        }),
    };

    return Effect.gen(function* () {
      const arweave = yield* ArweaveService;

      const upload = yield* Effect.forkChild(
        arweave
          .uploadFile({ file: TEST_FILE, contentType: "application/json" })
          .pipe(Effect.flip),
      );

      yield* TestClock.adjust(UPLOAD_TIMEOUT);

      const error = yield* Fiber.join(upload);

      expect({
        tag: error._tag,
        message: error.message,
        aborted,
      }).toStrictEqual({
        tag: "ArweaveUploadError",
        message: "Arweave upload timed out after 60 seconds",
        aborted: true,
      });
    }).pipe(Effect.provide(makeTestArweaveLayer(uploader)));
  });

  it.effect(
    "uploads the file with content type, app name and IPFS CID tags",
    () => {
      const uploads: Array<{
        readonly file: Buffer;
        readonly tags: ReadonlyArray<ArweaveTag>;
      }> = [];

      const uploader: ArweaveUploader = {
        uploadFile: async ({ file, tags }) => {
          uploads.push({ file, tags });

          return { id: "arweave-tx-1" };
        },
      };

      return Effect.gen(function* () {
        const arweave = yield* ArweaveService;

        const result = yield* arweave.uploadFile({
          file: TEST_FILE,
          contentType: "application/json",
          tags: [{ name: "Root-TX", value: "root-tx-1" }],
        });

        const upload = uploads[0];

        expect({
          result,
          calls: uploads.length,
          tags: upload?.tags,
          file: upload?.file,
        }).toStrictEqual({
          result: {
            id: "arweave-tx-1",
            cid: TEST_FILE_CID,
            uri: "ar://arweave-tx-1",
            gatewayUrl: "https://turbo-gateway.test/arweave-tx-1",
          },
          calls: 1,
          tags: [
            { name: "Content-Type", value: "application/json" },
            { name: "App-Name", value: "Sigle-Test" },
            { name: "IPFS-CID", value: TEST_FILE_CID },
            { name: "Root-TX", value: "root-tx-1" },
          ],
          file: TEST_FILE,
        });
      }).pipe(Effect.provide(makeTestArweaveLayer(uploader)));
    },
  );

  it.effect("wraps upload failures in ArweaveUploadError", () => {
    const uploader: ArweaveUploader = {
      uploadFile: async () => {
        throw new Error("turbo unreachable");
      },
    };

    return Effect.gen(function* () {
      const arweave = yield* ArweaveService;

      const error = yield* arweave
        .uploadFile({ file: TEST_FILE, contentType: "application/json" })
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(ArweaveUploadError);
      expect(error._tag).toBe("ArweaveUploadError");
      expect(error.message).toBe("turbo unreachable");
      expect(error.cause).toBeInstanceOf(Error);
    }).pipe(Effect.provide(makeTestArweaveLayer(uploader)));
  });

  it.effect(
    "reads the block heights of the mined transactions from the gateway",
    () => {
      const requests: Array<GatewayRequest> = [];

      const gateway = makeGatewayLayer(
        {
          data: {
            transactions: {
              edges: [
                { node: { id: "tx-mined", block: { height: 1_587_342 } } },
                { node: { id: "tx-pending", block: null } },
                // Not requested: a misbehaving gateway can't set its height.
                { node: { id: "tx-other", block: { height: 12 } } },
              ],
            },
          },
        },
        requests,
      );

      return Effect.gen(function* () {
        const arweave = yield* ArweaveService;

        const blockHeights = yield* arweave.getBlockHeights([
          "tx-mined",
          "tx-pending",
          "tx-unknown",
        ]);

        expect({
          blockHeights: [...blockHeights],
          url: requests[0]?.url,
          body: requests[0]?.body,
        }).toStrictEqual({
          blockHeights: [["tx-mined", 1_587_342]],
          url: "https://turbo-gateway.test/graphql",
          body: expect.objectContaining({
            variables: {
              ids: ["tx-mined", "tx-pending", "tx-unknown"],
              first: 3,
            },
          }),
        });
      }).pipe(Effect.provide(makeTestArweaveLayer(unusedUploader, gateway)));
    },
  );

  it.effect("fails with ArweaveGatewayError on GraphQL errors", () =>
    Effect.gen(function* () {
      const arweave = yield* ArweaveService;

      const error = yield* arweave.getBlockHeights(["tx-1"]).pipe(Effect.flip);

      expect({ tag: error._tag, message: error.message }).toStrictEqual({
        tag: "ArweaveGatewayError",
        message: "Arweave GraphQL query failed: rate limited",
      });
    }).pipe(
      Effect.provide(
        makeTestArweaveLayer(
          unusedUploader,
          makeGatewayLayer({ errors: [{ message: "rate limited" }] }),
        ),
      ),
    ),
  );
});
