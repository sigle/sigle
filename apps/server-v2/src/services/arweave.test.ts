import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { AppConfig } from "@/config";
import {
  ArweaveService,
  ArweaveUploadError,
  type ArweaveTag,
  type ArweaveUploader,
  makeArweaveService,
} from "@/services/arweave";

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
});
