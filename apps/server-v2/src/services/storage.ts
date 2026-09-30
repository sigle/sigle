import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Context, Data, Effect, Layer, Redacted } from "effect";
import { AppConfig, type AppConfigValues } from "@/config";

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

/** Minimal object storage port, implemented by the S3 client in production. */
export interface StorageUploader {
  readonly uploadFile: (options: {
    readonly body: Uint8Array;
    readonly cacheControl: string;
    readonly contentType: string;
    readonly key: string;
    readonly version: string;
  }) => Promise<void>;
}

export class StorageUploadError extends Data.TaggedError("StorageUploadError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

export interface StorageClient {
  readonly uploadFile: (
    options: StorageUploadOptions,
  ) => Effect.Effect<StoredObject, StorageUploadError>;
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

const makeS3Uploader = (config: AppConfigValues): StorageUploader => {
  const client = new S3Client({
    endpoint: config.R2_ENDPOINT,
    region: "auto",
    credentials: {
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: Redacted.value(config.R2_SECRET_ACCESS_KEY),
    },
    forcePathStyle: true,
  });

  return {
    uploadFile: async ({ body, cacheControl, contentType, key, version }) => {
      await client.send(
        new PutObjectCommand({
          Bucket: config.R2_BUCKET,
          Key: key,
          Body: body,
          CacheControl: cacheControl,
          ContentType: contentType,
          Metadata: { version },
        }),
      );
    },
  };
};

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
          yield* Effect.tryPromise({
            try: () =>
              uploader.uploadFile({
                body,
                cacheControl: CACHE_CONTROL,
                contentType,
                key,
                version,
              }),
            catch: toStorageError,
          }).pipe(Effect.tapError(logStorageError("upload", key)));

          return toStoredObject(key, version);
        }),
    } satisfies StorageClient;
  });

export const STORAGE_TEST_PUBLIC_URL = "https://cdn.test";

export interface StorageTestRecorder {
  readonly uploads: Array<StorageUploadOptions>;
}

export const makeStorageTestRecorder = (): StorageTestRecorder => ({
  uploads: [],
});

export interface StorageTestOverrides {
  readonly uploadFile?: (
    options: StorageUploadOptions,
  ) => Effect.Effect<StoredObject, StorageUploadError>;
}

export class StorageService extends Context.Service<
  StorageService,
  StorageClient
>()("sigle/StorageService") {
  static readonly layer: Layer.Layer<StorageService, never, AppConfig> =
    Layer.effect(
      StorageService,
      Effect.gen(function* () {
        const config = yield* AppConfig;

        return yield* makeStorageService(makeS3Uploader(config));
      }),
    );

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
    }));
}
