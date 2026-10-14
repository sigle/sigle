import { TurboFactory } from "@ardrive/turbo-sdk";
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
import { createHash } from "node:crypto";
import { AppConfig, type AppConfigValues } from "@/config";

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

export interface ArweaveTransaction {
  readonly id: string;
  /** Arweave address of the key that signed the transaction. */
  readonly ownerAddress: string;
  /** Null while the transaction is not included in a block. */
  readonly blockHeight: number | null;
}

export interface ArweaveTransactionsQuery {
  readonly owners: ReadonlyArray<string>;
  readonly tags: ReadonlyArray<ArweaveTag>;
  /** Only transactions included in a block at or above this height match. */
  readonly minBlockHeight: number;
  readonly after?: string | undefined;
}

export interface ArweaveTransactionsPage {
  readonly transactions: ReadonlyArray<ArweaveTransaction>;
  /** Cursor of the next page, or null when this is the last page. */
  readonly nextCursor: string | null;
}

/** Minimal Arweave upload port, implemented by the turbo client in production. */
export interface ArweaveUploader {
  readonly uploadFile: (options: {
    readonly file: Buffer;
    readonly tags: ReadonlyArray<ArweaveTag>;
  }) => Promise<{ readonly id: string }>;
  /** Arweave address of the key signing the uploads. */
  readonly getOwnerAddress: () => Promise<string>;
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
  /** Arweave address owning the transactions uploaded by this server. */
  readonly ownerAddress: string;
  readonly uploadFile: (
    options: ArweaveUploadOptions,
  ) => Effect.Effect<ArweaveUploadResult, ArweaveUploadError>;
  /** Lists transactions from the gateway GraphQL index, lowest block first. */
  readonly queryTransactions: (
    query: ArweaveTransactionsQuery,
  ) => Effect.Effect<ArweaveTransactionsPage, ArweaveGatewayError>;
  /** Reads the data of a transaction from the gateway as text. */
  readonly getData: (id: string) => Effect.Effect<string, ArweaveGatewayError>;
}

const TRANSACTIONS_PAGE_SIZE = 100;

const GATEWAY_TIMEOUT = "30 seconds";

const TRANSACTIONS_QUERY = `
  query Transactions(
    $owners: [String!]
    $tags: [TagFilter!]
    $minBlockHeight: Int
    $first: Int
    $after: String
  ) {
    transactions(
      owners: $owners
      tags: $tags
      block: { min: $minBlockHeight }
      first: $first
      after: $after
      sort: HEIGHT_ASC
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          owner {
            address
          }
          block {
            height
          }
        }
      }
    }
  }
`;

const TransactionsResponse = Schema.Struct({
  data: Schema.optionalKey(
    Schema.NullOr(
      Schema.Struct({
        transactions: Schema.Struct({
          pageInfo: Schema.Struct({ hasNextPage: Schema.Boolean }),
          edges: Schema.Array(
            Schema.Struct({
              cursor: Schema.String,
              node: Schema.Struct({
                id: Schema.String,
                owner: Schema.Struct({ address: Schema.String }),
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

/** Wire shape of the gateway GraphQL `transactions` response. */
export type ArweaveTransactionsResponse = typeof TransactionsResponse.Encoded;

const createCIDv1FromBuffer = async (buffer: Uint8Array): Promise<string> => {
  const hash = await sha256.digest(buffer);

  return CID.create(1, code, hash).toString();
};

const makeTurboUploader = (config: AppConfigValues): ArweaveUploader => {
  const turbo = TurboFactory.authenticated({
    privateKey: Redacted.value(config.ARWEAVE_PRIVATE_KEY),
    token: "solana",
  });

  return {
    uploadFile: ({ file, tags }) =>
      turbo.uploadFile({
        fileStreamFactory: () => file,
        fileSizeFactory: () => file.byteLength,
        dataItemOpts: {
          tags: [...tags],
        },
      }),
    // Gateways index every data item under the base64url SHA-256 of its
    // signer's public key, whatever the signature type.
    getOwnerAddress: async () => {
      const publicKey = await turbo.signer.getPublicKey();

      return createHash("sha256")
        .update(Uint8Array.from(publicKey))
        .digest("base64url");
    },
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

    const ownerAddress = yield* Effect.promise(() =>
      uploader.getOwnerAddress(),
    );

    return {
      ownerAddress,
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
            try: () => uploader.uploadFile({ file: data, tags: arweaveTags }),
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

          return {
            id,
            cid,
            uri: `ar://${id}`,
            gatewayUrl: `${gatewayUrl}/${id}`,
          };
        }),
      queryTransactions: (query: ArweaveTransactionsQuery) =>
        Effect.gen(function* () {
          const response = yield* HttpClientRequest.post("/graphql").pipe(
            HttpClientRequest.bodyJsonUnsafe({
              query: TRANSACTIONS_QUERY,
              variables: {
                owners: query.owners,
                tags: query.tags.map((tag) => ({
                  name: tag.name,
                  values: [tag.value],
                })),
                minBlockHeight: query.minBlockHeight,
                first: TRANSACTIONS_PAGE_SIZE,
                after: query.after ?? null,
              },
            }),
            gateway.execute,
            Effect.flatMap(
              HttpClientResponse.schemaBodyJson(TransactionsResponse),
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

          const lastEdge = connection.edges.at(-1);

          return {
            transactions: connection.edges.map((edge) => ({
              id: edge.node.id,
              ownerAddress: edge.node.owner.address,
              blockHeight: edge.node.block?.height ?? null,
            })),
            nextCursor:
              connection.pageInfo.hasNextPage && lastEdge !== undefined
                ? lastEdge.cursor
                : null,
          };
        }),
      getData: (id: string) =>
        gateway.get(`/${id}`).pipe(
          Effect.flatMap((response) => response.text),
          Effect.timeout(GATEWAY_TIMEOUT),
          Effect.mapError(
            (cause) =>
              new ArweaveGatewayError({
                cause,
                message: `Failed to read Arweave transaction ${id}: ${cause.message}`,
              }),
          ),
        ),
    } satisfies ArweaveClient;
  });

export const ARWEAVE_TEST_UPLOAD_ID = "arweave-test-upload-id";

export const ARWEAVE_TEST_OWNER_ADDRESS = "arweave-test-owner-address";

export const ARWEAVE_TEST_UPLOAD: ArweaveUploadResult = {
  id: ARWEAVE_TEST_UPLOAD_ID,
  cid: "bafkreietui4xdkiu4xvmx4fi2jivjtndbhb4drzpxomrjvd4mdz4w2avra",
  uri: `ar://${ARWEAVE_TEST_UPLOAD_ID}`,
  gatewayUrl: `https://turbo-gateway.com/${ARWEAVE_TEST_UPLOAD_ID}`,
};

/** A transaction served by the in-memory gateway of `ArweaveService.layerTest`. */
export interface ArweaveTestTransaction extends ArweaveTransaction {
  readonly tags: ReadonlyArray<ArweaveTag>;
  readonly data: string;
}

export interface ArweaveTestGateway {
  readonly transactions?: ReadonlyArray<ArweaveTestTransaction>;
  /** Records every GraphQL query sent to the gateway. */
  readonly queries?: Array<ArweaveTransactionsQuery>;
  readonly pageSize?: number;
}

/**
 * Applies the gateway GraphQL semantics (owner, tag and minimum block filters,
 * mined transactions only, lowest block first, cursor pagination) to an
 * in-memory list of transactions.
 */
const queryTestTransactions = (
  gateway: ArweaveTestGateway,
  query: ArweaveTransactionsQuery,
): ArweaveTransactionsPage => {
  const pageSize = gateway.pageSize ?? TRANSACTIONS_PAGE_SIZE;

  const matching = (gateway.transactions ?? [])
    .filter(
      (transaction) =>
        transaction.blockHeight !== null &&
        transaction.blockHeight >= query.minBlockHeight &&
        (query.owners.length === 0 ||
          query.owners.includes(transaction.ownerAddress)) &&
        query.tags.every((tag) =>
          transaction.tags.some(
            (candidate) =>
              candidate.name === tag.name && candidate.value === tag.value,
          ),
        ),
    )
    .toSorted(
      (first, second) => (first.blockHeight ?? 0) - (second.blockHeight ?? 0),
    );

  const start = query.after === undefined ? 0 : Number(query.after);
  const end = start + pageSize;

  return {
    transactions: matching
      .slice(start, end)
      .map(({ id, ownerAddress, blockHeight }) => ({
        id,
        ownerAddress,
        blockHeight,
      })),
    nextCursor: end < matching.length ? String(end) : null,
  };
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

        return yield* makeArweaveService(makeTurboUploader(config));
      }),
    ).pipe(Layer.provide(FetchHttpClient.layer));

  static readonly layerTest = (
    uploads: Array<ArweaveUploadOptions> = [],
    uploadFile: (
      options: ArweaveUploadOptions,
    ) => Effect.Effect<ArweaveUploadResult, ArweaveUploadError> = () =>
      Effect.succeed(ARWEAVE_TEST_UPLOAD),
    gateway: ArweaveTestGateway = {},
  ): Layer.Layer<ArweaveService> =>
    Layer.succeed(ArweaveService, {
      ownerAddress: ARWEAVE_TEST_OWNER_ADDRESS,
      uploadFile: (options) =>
        Effect.sync(() => {
          uploads.push(options);
        }).pipe(Effect.andThen(uploadFile(options))),
      queryTransactions: (query) =>
        Effect.sync(() => {
          gateway.queries?.push(query);

          return queryTestTransactions(gateway, query);
        }),
      getData: (id) => {
        const transaction = gateway.transactions?.find(
          (candidate) => candidate.id === id,
        );

        return transaction === undefined
          ? Effect.fail(
              new ArweaveGatewayError({
                cause: id,
                message: `Arweave gateway returned HTTP 404 for ${id}`,
              }),
            )
          : Effect.succeed(transaction.data);
      },
    });
}
