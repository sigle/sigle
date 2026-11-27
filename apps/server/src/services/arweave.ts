import { TurboUpload } from "@ardrive/turbo-upload";
import { ArweaveTags } from "@sigle/sdk";
import { Context, Data, Effect, Layer, Redacted, Schema } from "effect";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
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

export class ArweaveGatewayError extends Data.TaggedError(
  "ArweaveGatewayError",
)<{
  readonly cause: unknown;
  readonly message: string;
}> {}

export interface ArweaveClient {
  readonly uploadFile: (
    options: ArweaveUploadOptions,
  ) => Effect.Effect<ArweaveUploadResult, ArweaveUploadError>;
  /**
   * Block heights of up to `BLOCK_HEIGHTS_MAX_IDS` transactions from the
   * gateway GraphQL index, keyed by transaction id. Transactions not mined
   * yet or unknown to the gateway are left out.
   */
  readonly getBlockHeights: (
    ids: ReadonlyArray<string>,
  ) => Effect.Effect<ReadonlyMap<string, number>, ArweaveGatewayError>;
}

/** Page size limit of the gateway GraphQL `transactions` query. */
export const BLOCK_HEIGHTS_MAX_IDS = 100;

const GATEWAY_TIMEOUT = "30 seconds";

const BLOCK_HEIGHTS_QUERY = `
  query BlockHeights($ids: [ID!], $first: Int) {
    transactions(ids: $ids, first: $first) {
      edges {
        node {
          id
          block {
            height
          }
        }
      }
    }
  }
`;

const BlockHeightsResponse = Schema.Struct({
  data: Schema.optionalKey(
    Schema.NullOr(
      Schema.Struct({
        transactions: Schema.Struct({
          edges: Schema.Array(
            Schema.Struct({
              node: Schema.Struct({
                id: Schema.String,
                block: Schema.NullOr(Schema.Struct({ height: Schema.Int })),
              }),
            }),
          ),
        }),
      }),
    ),
  ),
  errors: Schema.optionalKey(
    Schema.Array(Schema.Struct({ message: Schema.String })),
  ),
});

/** Wire shape of the gateway GraphQL response to `getBlockHeights`. */
export type ArweaveBlockHeightsResponse = typeof BlockHeightsResponse.Encoded;

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

    const gateway = (yield* HttpClient.HttpClient).pipe(
      HttpClient.mapRequest(HttpClientRequest.prependUrl(gatewayUrl)),
      HttpClient.filterStatusOk,
    );

    return {
      uploadFile: ({ file, contentType, tags = [] }: ArweaveUploadOptions) =>
        Effect.gen(function* () {
          const data = Buffer.from(file);
          const cid = yield* Effect.promise(() => createCIDv1FromBuffer(data));

          const arweaveTags: ReadonlyArray<ArweaveTag> = [
            { name: "Content-Type", value: contentType },
            { name: ArweaveTags.appName, value: config.APP_ID },
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
      getBlockHeights: (ids: ReadonlyArray<string>) =>
        Effect.gen(function* () {
          const response = yield* HttpClientRequest.post("/graphql").pipe(
            HttpClientRequest.bodyJsonUnsafe({
              query: BLOCK_HEIGHTS_QUERY,
              variables: { ids, first: ids.length },
            }),
            gateway.execute,
            Effect.flatMap(
              HttpClientResponse.schemaBodyJson(BlockHeightsResponse),
            ),
            Effect.timeout(GATEWAY_TIMEOUT),
            Effect.mapError(
              (cause) =>
                new ArweaveGatewayError({
                  cause,
                  message: `Arweave GraphQL request failed: ${cause.message}`,
                }),
            ),
          );

          const connection = response.data?.transactions;

          if (response.errors !== undefined || connection === undefined) {
            return yield* new ArweaveGatewayError({
              cause: response.errors,
              message: `Arweave GraphQL query failed: ${
                response.errors?.map((error) => error.message).join(", ") ??
                "no data"
              }`,
            });
          }

          const requested = new Set(ids);

          return new Map(
            connection.edges.flatMap(({ node }) =>
              node.block !== null && requested.has(node.id)
                ? [[node.id, node.block.height] as const]
                : [],
            ),
          );
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
    ).pipe(Layer.provide(FetchHttpClient.layer));

  static readonly layerTest = (
    uploads: Array<ArweaveUploadOptions> = [],
    uploadFile: (
      options: ArweaveUploadOptions,
    ) => Effect.Effect<ArweaveUploadResult, ArweaveUploadError> = () =>
      Effect.succeed(ARWEAVE_TEST_UPLOAD),
    /** Block heights of the mined transactions, keyed by transaction id. */
    blockHeights: ReadonlyMap<string, number> = new Map(),
  ): Layer.Layer<ArweaveService> =>
    Layer.succeed(ArweaveService, {
      uploadFile: (options) =>
        Effect.sync(() => {
          uploads.push(options);
        }).pipe(Effect.andThen(uploadFile(options))),
      getBlockHeights: (ids) =>
        Effect.sync(
          () =>
            new Map(
              ids.flatMap((id) => {
                const height = blockHeights.get(id);

                return height === undefined ? [] : [[id, height] as const];
              }),
            ),
        ),
    });
}
