import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { vi } from "vitest";
import { AppConfig } from "@/config";
import { ArweaveService, ArweaveUploadError } from "@/services/arweave";

const { uploadFileMock } = vi.hoisted(() => ({
  uploadFileMock: vi.fn(),
}));

vi.mock<typeof import("@ardrive/turbo-sdk")>(
  import("@ardrive/turbo-sdk"),
  () =>
    ({
      TurboFactory: {
        authenticated: () => ({
          uploadFile: uploadFileMock,
        }),
      },
    }) as unknown as typeof import("@ardrive/turbo-sdk"),
);

const TEST_FILE = Buffer.from(JSON.stringify({ hello: "world" }));

const TEST_FILE_CID =
  "bafkreietui4xdkiu4xvmx4fi2jivjtndbhb4drzpxomrjvd4mdz4w2avra";

describe("arweave service", () => {
  it.effect(
    "uploads the file with content type, app name and IPFS CID tags",
    () => {
      uploadFileMock.mockReset();
      uploadFileMock.mockResolvedValue({ id: "arweave-tx-1" });

      return Effect.gen(function* () {
        const arweave = yield* ArweaveService;

        const result = yield* arweave.uploadFile({
          file: TEST_FILE,
          contentType: "application/json",
          tags: [{ name: "Root-TX", value: "root-tx-1" }],
        });

        expect(result).toStrictEqual({ id: "arweave-tx-1" });
        expect(uploadFileMock).toHaveBeenCalledTimes(1);

        const options = uploadFileMock.mock.calls[0]?.[0];
        expect(options?.dataItemOpts.tags).toStrictEqual([
          { name: "Content-Type", value: "application/json" },
          { name: "App-Name", value: "Sigle-Test" },
          { name: "IPFS-CID", value: TEST_FILE_CID },
          { name: "Root-TX", value: "root-tx-1" },
        ]);
        expect(options?.fileStreamFactory()).toStrictEqual(TEST_FILE);
        expect(options?.fileSizeFactory()).toBe(TEST_FILE.byteLength);
      }).pipe(
        Effect.provide(ArweaveService.layer),
        Effect.provide(AppConfig.layerTest({ APP_ID: "Sigle-Test" })),
      );
    },
  );

  it.effect("wraps upload failures in ArweaveUploadError", () => {
    uploadFileMock.mockReset();
    uploadFileMock.mockRejectedValue(new Error("turbo unreachable"));

    return Effect.gen(function* () {
      const arweave = yield* ArweaveService;

      const error = yield* arweave
        .uploadFile({ file: TEST_FILE, contentType: "application/json" })
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(ArweaveUploadError);
      expect(error._tag).toBe("ArweaveUploadError");
      expect(error.message).toBe("turbo unreachable");
      expect(error.cause).toBeInstanceOf(Error);
    }).pipe(
      Effect.provide(ArweaveService.layer),
      Effect.provide(AppConfig.layerTest()),
    );
  });
});
