import { TurboFactory } from "@ardrive/turbo-sdk";
import { Context, Data, Effect, Layer, Redacted } from "effect";
import { CID } from "multiformats/cid";
import { code } from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";
import { AppConfig } from "@/config";

export type ArweaveContentType = "application/json";

export interface ArweaveTag {
  readonly name: string;
  readonly value: string;
}

export interface ArweaveUploadOptions {
  readonly file: Uint8Array;
  readonly contentType: ArweaveContentType;
  readonly tags?: ReadonlyArray<ArweaveTag>;
}

export class ArweaveUploadError extends Data.TaggedError("ArweaveUploadError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

export interface ArweaveClient {
  readonly uploadFile: (
    options: ArweaveUploadOptions,
  ) => Effect.Effect<{ readonly id: string }, ArweaveUploadError>;
}

const createCIDv1FromBuffer = async (buffer: Uint8Array): Promise<string> => {
  const hash = await sha256.digest(buffer);
  return CID.create(1, code, hash).toString();
};

export const makeArweaveService = Effect.gen(function* () {
  const config = yield* AppConfig;
  const turbo = TurboFactory.authenticated({
    privateKey: Redacted.value(config.ARWEAVE_PRIVATE_KEY),
    token: "solana",
  });

  return {
    uploadFile: ({ file, contentType, tags = [] }) =>
      Effect.gen(function* () {
        const data = Buffer.from(file);
        const cid = yield* Effect.promise(() => createCIDv1FromBuffer(data));

        const arweaveTags: ReadonlyArray<ArweaveTag> = [
          { name: "Content-Type", value: contentType },
          { name: "App-Name", value: config.APP_ID },
          { name: "IPFS-CID", value: cid },
          ...tags,
        ];

        return yield* Effect.tryPromise({
          try: async () => {
            const upload = await turbo.uploadFile({
              fileStreamFactory: () => data,
              fileSizeFactory: () => data.byteLength,
              dataItemOpts: {
                tags: [...arweaveTags],
              },
            });

            return { id: upload.id };
          },
          catch: (cause) =>
            new ArweaveUploadError({
              cause,
              message: cause instanceof Error ? cause.message : String(cause),
            }),
        }).pipe(
          Effect.tapError((error) =>
            Effect.logError("Failed to upload to Arweave", {
              cause: error.cause,
              contentType,
              tags: arweaveTags,
            }),
          ),
        );
      }),
  } satisfies ArweaveClient;
});

export const ARWEAVE_TEST_UPLOAD_ID = "arweave-test-upload-id";

export class ArweaveService extends Context.Service<
  ArweaveService,
  ArweaveClient
>()("sigle/ArweaveService") {
  static readonly layer: Layer.Layer<ArweaveService, never, AppConfig> =
    Layer.effect(ArweaveService, makeArweaveService);

  static readonly layerTest = (
    uploads: Array<ArweaveUploadOptions> = [],
    uploadFile: (
      options: ArweaveUploadOptions,
    ) => Effect.Effect<{ readonly id: string }, ArweaveUploadError> = () =>
      Effect.succeed({ id: ARWEAVE_TEST_UPLOAD_ID }),
  ): Layer.Layer<ArweaveService> =>
    Layer.succeed(ArweaveService, {
      uploadFile: (options) =>
        Effect.sync(() => {
          uploads.push(options);
        }).pipe(Effect.andThen(uploadFile(options))),
    });
}
