import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { AppConfig } from "@/config";
import {
  makeStorageService,
  StorageService,
  StorageUploadError,
  type StorageUploader,
} from "@/services/storage";

const TEST_BODY = new Uint8Array([1, 2, 3, 4]);

const makeTestStorageLayer = (
  uploader: StorageUploader,
): Layer.Layer<StorageService> =>
  Layer.effect(StorageService, makeStorageService(uploader)).pipe(
    Layer.provide(AppConfig.layerTest({ R2_PUBLIC_URL: "https://cdn.test/" })),
  );

describe("storage service", () => {
  it.effect("uploads the object and returns its public url", () => {
    const uploads: Array<{
      readonly body: Uint8Array;
      readonly cacheControl: string;
      readonly contentType: string;
      readonly key: string;
    }> = [];

    const uploader: StorageUploader = {
      uploadFile: async (options) => {
        uploads.push(options);
      },
    };

    return Effect.gen(function* () {
      const storage = yield* StorageService;

      const result = yield* storage.uploadFile({
        body: TEST_BODY,
        contentType: "image/webp",
        key: "u/user-1/avatar.webp",
      });

      expect({
        result,
        calls: uploads.length,
        upload: uploads[0],
      }).toStrictEqual({
        result: {
          key: "u/user-1/avatar.webp",
          url: "https://cdn.test/u/user-1/avatar.webp",
        },
        calls: 1,
        upload: {
          body: TEST_BODY,
          cacheControl: "public, max-age=31536000, immutable",
          contentType: "image/webp",
          key: "u/user-1/avatar.webp",
        },
      });
    }).pipe(Effect.provide(makeTestStorageLayer(uploader)));
  });

  it.effect("wraps upload failures in StorageUploadError", () => {
    const uploader: StorageUploader = {
      uploadFile: async () => {
        throw new Error("r2 unreachable");
      },
    };

    return Effect.gen(function* () {
      const storage = yield* StorageService;

      const error = yield* storage
        .uploadFile({
          body: TEST_BODY,
          contentType: "image/webp",
          key: "u/user-1/avatar.webp",
        })
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(StorageUploadError);
      expect(error._tag).toBe("StorageUploadError");
      expect(error.message).toBe("r2 unreachable");
      expect(error.cause).toBeInstanceOf(Error);
    }).pipe(Effect.provide(makeTestStorageLayer(uploader)));
  });
});
