import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Context, Data, Effect, Layer, Redacted } from "effect";
import { AppConfig, type AppConfigValues } from "@/config";

export interface StorageUploadOptions {
  readonly body: Uint8Array;
  readonly contentType: string;
  readonly key: string;
}

export interface StorageUploadResult {
  readonly key: string;
  readonly url: string;
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
  }) => Promise<void>;
}

export class StorageUploadError extends Data.TaggedError("StorageUploadError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

export interface StorageClient {
  readonly uploadFile: (
    options: StorageUploadOptions,
  ) => Effect.Effect<StorageUploadResult, StorageUploadError>;
}

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
    uploadFile: async ({ body, cacheControl, contentType, key }) => {
      await client.send(
        new PutObjectCommand({
          Bucket: config.R2_BUCKET,
          Key: key,
          Body: body,
          CacheControl: cacheControl,
          ContentType: contentType,
        }),
      );
    },
  };
};

export const makeStorageService = (uploader: StorageUploader) =>
  Effect.gen(function* () {
    const config = yield* AppConfig;
    const publicUrl = config.R2_PUBLIC_URL.replace(/\/+$/, "");

    return {
      uploadFile: ({ body, contentType, key }: StorageUploadOptions) =>
        Effect.gen(function* () {
          yield* Effect.tryPromise({
            try: () =>
              uploader.uploadFile({
                body,
                cacheControl: CACHE_CONTROL,
                contentType,
                key,
              }),
            catch: (cause) =>
              new StorageUploadError({
                cause,
                message: cause instanceof Error ? cause.message : String(cause),
              }),
          }).pipe(
            Effect.tapError((error) =>
              Effect.logError("Failed to upload to object storage", {
                cause: error.cause,
                contentType,
                key,
              }),
            ),
          );

          return { key, url: `${publicUrl}/${key}` };
        }),
    } satisfies StorageClient;
  });

export const STORAGE_TEST_PUBLIC_URL = "https://cdn.test";

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

  static readonly layerTest = (
    uploads: Array<StorageUploadOptions> = [],
    uploadFile: (
      options: StorageUploadOptions,
    ) => Effect.Effect<StorageUploadResult, StorageUploadError> = (options) =>
      Effect.succeed({
        key: options.key,
        url: `${STORAGE_TEST_PUBLIC_URL}/${options.key}`,
      }),
  ): Layer.Layer<StorageService> =>
    Layer.succeed(StorageService, {
      uploadFile: (options) =>
        Effect.sync(() => {
          uploads.push(options);
        }).pipe(Effect.andThen(uploadFile(options))),
    });
}
