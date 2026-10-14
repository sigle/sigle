import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { afterEach, vi } from "vite-plus/test";
import { AppConfig } from "@/config";
import {
  ArweaveService,
  ArweaveUploadError,
  type ArweaveTag,
  type ArweaveTransactionsResponse,
  type ArweaveUploader,
  makeArweaveService,
} from "@/services/arweave";

const unusedUploader: ArweaveUploader = {
  uploadFile: async () => ({ id: "unused" }),
  getOwnerAddress: async () => "owner-address",
};

const stubGatewayResponse = (
  body: ArweaveTransactionsResponse,
  requests: Array<{ url: string; body: unknown }>,
) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      requests.push({
        url: String(input),
        body: JSON.parse(String(init?.body)),
      });

      return Response.json(body);
    }),
  );

const TEST_FILE = Buffer.from(JSON.stringify({ hello: "world" }));

const TEST_FILE_CID =
  "bafkreietui4xdkiu4xvmx4fi2jivjtndbhb4drzpxomrjvd4mdz4w2avra";

const makeTestArweaveLayer = (
  uploader: ArweaveUploader,
): Layer.Layer<ArweaveService> =>
  Layer.effect(ArweaveService, makeArweaveService(uploader)).pipe(
    Layer.provide(
      AppConfig.layerTest({
        APP_ID: "Sigle-Test",
        ARWEAVE_GATEWAY_URL: "https://turbo-gateway.test/",
      }),
    ),
  );

describe("arweave service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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
        getOwnerAddress: async () => "owner-address",
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
      getOwnerAddress: async () => "owner-address",
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
    "queries the gateway GraphQL index and returns the next page cursor",
    () => {
      const requests: Array<{ url: string; body: unknown }> = [];

      return Effect.gen(function* () {
        stubGatewayResponse(
          {
            data: {
              transactions: {
                pageInfo: { hasNextPage: true },
                edges: [
                  {
                    cursor: "cursor-1",
                    node: {
                      id: "tx-1",
                      owner: { address: "owner-address" },
                      block: { height: 5 },
                    },
                  },
                  {
                    cursor: "cursor-2",
                    node: {
                      id: "tx-2",
                      owner: { address: "owner-address" },
                      block: null,
                    },
                  },
                ],
              },
            },
          },
          requests,
        );

        const arweave = yield* ArweaveService;

        const page = yield* arweave.queryTransactions({
          owners: ["owner-address"],
          tags: [{ name: "Type", value: "profile" }],
          minBlockHeight: 5,
        });

        expect({ page, requests }).toStrictEqual({
          page: {
            transactions: [
              { id: "tx-1", ownerAddress: "owner-address", blockHeight: 5 },
              { id: "tx-2", ownerAddress: "owner-address", blockHeight: null },
            ],
            nextCursor: "cursor-2",
          },
          requests: [
            {
              url: "https://turbo-gateway.test/graphql",
              body: {
                query: expect.any(String),
                variables: {
                  owners: ["owner-address"],
                  tags: [{ name: "Type", values: ["profile"] }],
                  minBlockHeight: 5,
                  first: 100,
                  after: null,
                },
              },
            },
          ],
        });
      }).pipe(Effect.provide(makeTestArweaveLayer(unusedUploader)));
    },
  );

  it.effect("fails when the GraphQL query returns errors", () =>
    Effect.gen(function* () {
      stubGatewayResponse(
        { data: null, errors: [{ message: "Unknown type TagFilter" }] },
        [],
      );

      const arweave = yield* ArweaveService;

      const error = yield* arweave
        .queryTransactions({ owners: [], tags: [], minBlockHeight: 0 })
        .pipe(Effect.flip);

      expect({ tag: error._tag, message: error.message }).toStrictEqual({
        tag: "ArweaveGatewayError",
        message: "Arweave GraphQL query failed: Unknown type TagFilter",
      });
    }).pipe(Effect.provide(makeTestArweaveLayer(unusedUploader))),
  );
});
