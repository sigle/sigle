import { TurboUpload } from "@ardrive/turbo-upload";
import { Context, Data, Effect, Layer, Redacted } from "effect";
import { CID } from "multiformats/cid";
import { code } from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";
import { AppConfig } from "@/config";

export type ArweaveContentType =
  | "application/json"
  | "application/vnd.opentimestamps.ots";

export interface ArweaveTag {
  readonly name: string;
  readonly value: string;
}

export interface ArweaveUploadOptions {
  readonly file: Uint8Array;
  readonly contentType: ArweaveContentType;
  readonly tags?: ReadonlyArray<ArweaveTag>;
}

export interface ArweaveUploadResult {
  readonly id: string;
  readonly cid: string;
  readonly uri: string;
  readonly gatewayUrl: string;
}

/** Minimal Arweave upload port, implemented by the turbo client in production. */
export interface ArweaveUploader {
  readonly uploadFile: (options: {
    readonly file: Buffer;
    readonly tags: ReadonlyArray<ArweaveTag>;
    readonly signal: AbortSignal;
  }) => Promise<{ readonly id: string }>;
}

export class ArweaveUploadError extends Data.TaggedError("ArweaveUploadError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

export interface ArweaveClient {
  readonly uploadFile: (
    options: ArweaveUploadOptions,
  ) => Effect.Effect<ArweaveUploadResult, ArweaveUploadError>;
}

// Below the 2 minute upload claim lease of the publish job, so an upload is
// given up before another worker can take over the claim and upload again.
export const UPLOAD_TIMEOUT = "60 seconds";

const createCIDv1FromBuffer = async (buffer: Uint8Array): Promise<string> => {
  const hash = await sha256.digest(buffer);

  return CID.create(1, code, hash).toString();
};

const makeTurboUploader = (turbo: TurboUpload): ArweaveUploader => {
  return {
    uploadFile: ({ file, tags, signal }) =>
      turbo.upload({ data: file, tags: [...tags], signal }),
  };
};

export const makeArweaveService = (uploader: ArweaveUploader) =>
  Effect.gen(function* () {
    const config = yield* AppConfig;
    const gatewayUrl = config.ARWEAVE_GATEWAY_URL.replace(/\/+$/, "");

    return {
      uploadFile: ({ file, contentType, tags = [] }: ArweaveUploadOptions) =>
        Effect.gen(function* () {
          const data = Buffer.from(file);
          const cid = yield* Effect.promise(() => createCIDv1FromBuffer(data));

          const arweaveTags: ReadonlyArray<ArweaveTag> = [
            { name: "Content-Type", value: contentType },
            { name: "App-Name", value: config.APP_ID },
            { name: "IPFS-CID", value: cid },
            ...tags,
          ];

          const { id } = yield* Effect.tryPromise({
            // Aborted when the upload times out.
            try: (signal) =>
              uploader.uploadFile({ file: data, tags: arweaveTags, signal }),
            catch: (cause) =>
              new ArweaveUploadError({
                cause,
                message: cause instanceof Error ? cause.message : String(cause),
              }),
          }).pipe(
            Effect.timeout(UPLOAD_TIMEOUT),
            Effect.catchTag("TimeoutError", (cause) =>
              Effect.fail(
                new ArweaveUploadError({
                  cause,
                  message: `Arweave upload timed out after ${UPLOAD_TIMEOUT}`,
                }),
              ),
            ),
            Effect.tapError((error) =>
              Effect.logError("Failed to upload to Arweave", {
                cause: error.cause,
                contentType,
                tags: arweaveTags,
              }),
            ),
          );

          return {
            id,
            cid,
            uri: `ar://${id}`,
            gatewayUrl: `${gatewayUrl}/${id}`,
          };
        }),
    } satisfies ArweaveClient;
  });

export const ARWEAVE_TEST_UPLOAD_ID = "arweave-test-upload-id";

export const ARWEAVE_TEST_UPLOAD: ArweaveUploadResult = {
  id: ARWEAVE_TEST_UPLOAD_ID,
  cid: "bafkreietui4xdkiu4xvmx4fi2jivjtndbhb4drzpxomrjvd4mdz4w2avra",
  uri: `ar://${ARWEAVE_TEST_UPLOAD_ID}`,
  gatewayUrl: `https://turbo-gateway.com/${ARWEAVE_TEST_UPLOAD_ID}`,
};

export class ArweaveService extends Context.Service<
  ArweaveService,
  ArweaveClient
>()("sigle/ArweaveService") {
  static readonly layer: Layer.Layer<ArweaveService, never, AppConfig> =
    Layer.effect(
      ArweaveService,
      Effect.gen(function* () {
        const config = yield* AppConfig;

        const turbo = TurboUpload.production({
          jwk: Redacted.value(config.ARWEAVE_PRIVATE_KEY),
          token: "solana",
        });

        // The Turbo Credits paying for uploads are held by this address:
        // top it up at https://console.ar.io/topup.
        yield* Effect.logInfo("Arweave uploader initialized", {
          solanaAddress: turbo.address,
        });

        return yield* makeArweaveService(makeTurboUploader(turbo));
      }),
    );

  static readonly layerTest = (
    uploads: Array<ArweaveUploadOptions> = [],
    uploadFile: (
      options: ArweaveUploadOptions,
    ) => Effect.Effect<ArweaveUploadResult, ArweaveUploadError> = () =>
      Effect.succeed(ARWEAVE_TEST_UPLOAD),
  ): Layer.Layer<ArweaveService> =>
    Layer.succeed(ArweaveService, {
      uploadFile: (options) =>
        Effect.sync(() => {
          uploads.push(options);
        }).pipe(Effect.andThen(uploadFile(options))),
    });
}
