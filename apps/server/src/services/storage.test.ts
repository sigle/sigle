import { describe, expect, it } from "@effect/vitest";
import { Data, Effect, Layer } from "effect";
import type { StorageUploader } from "@/services/storage";
import { AppConfig } from "@/config";
import {
  makeStorageService,
  StorageService,
  StorageUploadError,
} from "@/services/storage";

const TEST_BODY = new Uint8Array([1, 2, 3, 4]);

class R2Unreachable extends Data.TaggedError("R2Unreachable")<{
  readonly message: string;
}> {}

const makeTestStorageLayer = (
  uploader: StorageUploader,
): Layer.Layer<StorageService> =>
  Layer.effect(StorageService, makeStorageService(uploader)).pipe(
    Layer.provide(AppConfig.layerTest({ R2_PUBLIC_URL: "https://cdn.test/" })),
  );

interface RecordedUpload {
  readonly body: Uint8Array;
  readonly cacheControl: string;
  readonly contentType: string;
  readonly key: string;
  readonly version: string;
}

const makeRecordingUploader = (
  uploads: Array<RecordedUpload>,
): StorageUploader => ({
  uploadFile: (options) =>
    Effect.sync(() => {
      uploads.push(options);
    }),
  deleteFile: () => Effect.void,
});

describe("storage service", () => {
  it.effect(
    "uploads the object with its version and returns its public url",
    () => {
      const uploads: Array<RecordedUpload> = [];

      return Effect.gen(function* () {
        const storage = yield* StorageService;

        const result = yield* storage.uploadFile({
          body: TEST_BODY,
          contentType: "image/webp",
          key: "u/user-1/avatar.webp",
          version: "version-1",
        });

        expect({
          result,
          calls: uploads.length,
          upload: uploads[0],
        }).toStrictEqual({
          result: {
            key: "u/user-1/avatar.webp",
            url: "https://cdn.test/u/user-1/avatar.webp",
            version: "version-1",
          },
          calls: 1,
          upload: {
            body: TEST_BODY,
            cacheControl: "public, max-age=31536000, immutable",
            contentType: "image/webp",
            key: "u/user-1/avatar.webp",
            version: "version-1",
          },
        });
      }).pipe(
        Effect.provide(makeTestStorageLayer(makeRecordingUploader(uploads))),
      );
    },
  );

  it.effect("wraps upload failures in StorageUploadError", () => {
    const uploader: StorageUploader = {
      uploadFile: () =>
        Effect.fail(new R2Unreachable({ message: "r2 unreachable" })),
      deleteFile: () => Effect.void,
    };

    return Effect.gen(function* () {
      const storage = yield* StorageService;

      const error = yield* storage
        .uploadFile({
          body: TEST_BODY,
          contentType: "image/webp",
          key: "u/user-1/avatar.webp",
          version: "version-1",
        })
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(StorageUploadError);
      expect(error._tag).toBe("StorageUploadError");
      expect(error.message).toBe("r2 unreachable");
      expect(error.cause).toBeInstanceOf(R2Unreachable);
    }).pipe(Effect.provide(makeTestStorageLayer(uploader)));
  });
});
