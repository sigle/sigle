import type { HttpClient } from "effect/http";
import * as S3 from "@distilled.cloud/s3";
import { Credentials } from "@distilled.cloud/s3/Credentials";
import { Endpoint } from "@distilled.cloud/s3/Endpoint";
import { Context, Data, Effect, Layer, Redacted } from "effect";
import { FetchHttpClient } from "effect/http";
import { AppConfig } from "@/config";

export interface StorageUploadOptions {
  readonly body: Uint8Array;
  readonly contentType: string;
  readonly key: string;
  readonly version: string;
}

export interface StoredObject {
  readonly key: string;
  readonly url: string;
  readonly version: string;
}

/**
 * Uploaded objects are served under a versioned URL, so the underlying object
 * can be cached forever even though its key is stable.
 */
const CACHE_CONTROL = "public, max-age=31536000, immutable";

/** Minimal object storage port, implemented by R2 in production. */
export interface StorageUploader {
  readonly uploadFile: (options: {
    readonly body: Uint8Array;
    readonly cacheControl: string;
    readonly contentType: string;
    readonly key: string;
    readonly version: string;
  }) => Effect.Effect<void, unknown>;
  readonly deleteFile: (key: string) => Effect.Effect<void, unknown>;
}

export class StorageUploadError extends Data.TaggedError("StorageUploadError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

export interface StorageClient {
  readonly uploadFile: (
    options: StorageUploadOptions,
  ) => Effect.Effect<StoredObject, StorageUploadError>;
  /** Deletes an object. Deleting a missing object succeeds. */
  readonly deleteFile: (key: string) => Effect.Effect<void, StorageUploadError>;
}

const toStorageError = (cause: unknown): StorageUploadError =>
  new StorageUploadError({
    cause,
    message: cause instanceof Error ? cause.message : String(cause),
  });

const logStorageError =
  (operation: string, key: string) => (error: StorageUploadError) =>
    Effect.logError("Object storage operation failed", {
      cause: error.cause,
      key,
      operation,
    });

/** The R2 bucket's S3 API, signed with the configured keys. */
const r2Layer = Layer.unwrap(
  Effect.map(AppConfig, (config) =>
    Layer.mergeAll(
      FetchHttpClient.layer,
      // A custom endpoint bypasses S3's endpoint rules, so objects are
      // addressed path-style: `<endpoint>/<bucket>/<key>`.
      Layer.succeed(Endpoint, Effect.succeed(config.R2_ENDPOINT)),
      Layer.succeed(
        Credentials,
        Effect.succeed({
          accessKeyId: Redacted.make(config.R2_ACCESS_KEY_ID),
          secretAccessKey: config.R2_SECRET_ACCESS_KEY,
          sessionToken: undefined,
          region: "auto",
        }),
      ),
    ),
  ),
);

const makeR2Uploader = Effect.gen(function* () {
  const config = yield* AppConfig;

  const r2 = yield* Effect.context<
    Credentials | Endpoint | HttpClient.HttpClient
  >();

  return {
    uploadFile: ({ body, cacheControl, contentType, key, version }) =>
      S3.putObject({
        Bucket: config.R2_BUCKET,
        Key: key,
        Body: body,
        CacheControl: cacheControl,
        ContentType: contentType,
        Metadata: { version },
      }).pipe(Effect.asVoid, Effect.provide(r2)),
    deleteFile: (key) =>
      S3.deleteObject({ Bucket: config.R2_BUCKET, Key: key }).pipe(
        Effect.asVoid,
        Effect.provide(r2),
      ),
  } satisfies StorageUploader;
});

export const makeStorageService = (uploader: StorageUploader) =>
  Effect.gen(function* () {
    const config = yield* AppConfig;
    const publicUrl = config.R2_PUBLIC_URL.replace(/\/+$/, "");

    const toStoredObject = (key: string, version: string): StoredObject => ({
      key,
      url: `${publicUrl}/${key}`,
      version,
    });

    return {
      uploadFile: ({ body, contentType, key, version }: StorageUploadOptions) =>
        Effect.gen(function* () {
          yield* uploader
            .uploadFile({
              body,
              cacheControl: CACHE_CONTROL,
              contentType,
              key,
              version,
            })
            .pipe(
              Effect.mapError(toStorageError),
              Effect.tapError(logStorageError("upload", key)),
            );

          return toStoredObject(key, version);
        }),
      deleteFile: (key: string) =>
        uploader
          .deleteFile(key)
          .pipe(
            Effect.mapError(toStorageError),
            Effect.tapError(logStorageError("delete", key)),
          ),
    } satisfies StorageClient;
  });

export const STORAGE_TEST_PUBLIC_URL = "https://cdn.test";

export interface StorageTestRecorder {
  readonly uploads: Array<StorageUploadOptions>;
  readonly deletes: Array<string>;
}

export const makeStorageTestRecorder = (): StorageTestRecorder => ({
  uploads: [],
  deletes: [],
});

export interface StorageTestOverrides {
  readonly uploadFile?: (
    options: StorageUploadOptions,
  ) => Effect.Effect<StoredObject, StorageUploadError>;
  readonly deleteFile?: (
    key: string,
  ) => Effect.Effect<void, StorageUploadError>;
}

export class StorageService extends Context.Service<
  StorageService,
  StorageClient
>()("sigle/StorageService") {
  static readonly layer: Layer.Layer<StorageService, never, AppConfig> =
    Layer.effect(
      StorageService,
      Effect.flatMap(makeR2Uploader, makeStorageService),
    ).pipe(Layer.provide(r2Layer));

  /**
   * Recording storage fake used by endpoint tests.
   */
  static readonly layerTest = (
    recorder: StorageTestRecorder = makeStorageTestRecorder(),
    overrides: StorageTestOverrides = {},
  ): Layer.Layer<StorageService> =>
    Layer.sync(StorageService, () => ({
      uploadFile: (options) => {
        recorder.uploads.push(options);

        return (
          overrides.uploadFile?.(options) ??
          Effect.succeed({
            key: options.key,
            url: `${STORAGE_TEST_PUBLIC_URL}/${options.key}`,
            version: options.version,
          })
        );
      },
      deleteFile: (key) => {
        recorder.deletes.push(key);

        return overrides.deleteFile?.(key) ?? Effect.void;
      },
    }));
}
