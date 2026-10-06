import { ArweaveTags, ArweaveTransactionTypes } from "@sigle/sdk";
import { Context, Data, Effect, Layer, Option, Schema } from "effect";
import {
  HttpClient,
  HttpBody,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
import { AppConfig } from "@/config";
import { makeJsonHttpClient } from "@/lib/http";

/** Number of transactions fetched per Arweave GraphQL page, mirroring v1. */
export const ARWEAVE_GRAPHQL_PAGE_SIZE = 100;

export class ArweaveGraphQLError extends Data.TaggedError(
  "ArweaveGraphQLError",
)<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export const ArweaveTransactionBlockSchema = Schema.Struct({
  height: Schema.Int,
  timestamp: Schema.Int,
});

export type ArweaveTransactionBlock = typeof ArweaveTransactionBlockSchema.Type;

export const ArweaveTransactionEdgeSchema = Schema.Struct({
  cursor: Schema.String,
  node: Schema.Struct({
    id: Schema.String,
    bundledIn: Schema.optionalKey(
      Schema.NullOr(Schema.Struct({ id: Schema.String })),
    ),
    tags: Schema.optionalKey(
      Schema.Array(
        Schema.Struct({ name: Schema.String, value: Schema.String }),
      ),
    ),
    block: Schema.optionalKey(Schema.NullOr(ArweaveTransactionBlockSchema)),
  }),
});

export type ArweaveTransactionEdge = typeof ArweaveTransactionEdgeSchema.Type;

const TransactionsResponseSchema = Schema.Struct({
  data: Schema.optionalKey(
    Schema.Struct({
      transactions: Schema.optionalKey(
        Schema.Struct({ edges: Schema.Array(ArweaveTransactionEdgeSchema) }),
      ),
    }),
  ),
  errors: Schema.optionalKey(
    Schema.Array(Schema.Struct({ message: Schema.String })),
  ),
});

export interface ArweaveTagFilter {
  readonly name: string;
  readonly values: ReadonlyArray<string>;
}

export type ArweaveGraphQLQuery =
  | {
      readonly kind: "transactionsByTags";
      readonly tags: ReadonlyArray<ArweaveTagFilter>;
      readonly minBlockHeight: number;
      readonly after: string | undefined;
    }
  | {
      readonly kind: "transactionsByIds";
      readonly ids: ReadonlyArray<string>;
    };

const TRANSACTIONS_BY_TAGS_QUERY = `query TransactionsByTags($tags: [TagFilter!]!, $minBlockHeight: Int, $after: String, $first: Int!) {
  transactions(tags: $tags, block: { min: $minBlockHeight }, first: $first, sort: HEIGHT_ASC, after: $after) {
    edges {
      cursor
      node {
        id
        bundledIn { id }
        tags { name value }
        block { height timestamp }
      }
    }
  }
}`;

const TRANSACTIONS_BY_IDS_QUERY = `query TransactionsByIds($ids: [ID!]!, $first: Int!) {
  transactions(ids: $ids, first: $first, sort: HEIGHT_ASC) {
    edges {
      cursor
      node { id block { height timestamp } }
    }
  }
}`;

interface TransactionsByTagsVariables {
  readonly tags: ReadonlyArray<ArweaveTagFilter>;
  readonly minBlockHeight: number;
  readonly after: string | undefined;
  readonly first: number;
}

interface TransactionsByIdsVariables {
  readonly ids: ReadonlyArray<string>;
  readonly first: number;
}

interface QueryBody {
  readonly query: string;
  readonly variables: TransactionsByTagsVariables | TransactionsByIdsVariables;
}

const encodeQuery = (query: ArweaveGraphQLQuery): QueryBody => {
  if (query.kind === "transactionsByTags") {
    return {
      query: TRANSACTIONS_BY_TAGS_QUERY,
      variables: {
        tags: query.tags,
        minBlockHeight: query.minBlockHeight,
        after: query.after,
        first: ARWEAVE_GRAPHQL_PAGE_SIZE,
      },
    };
  }

  return {
    query: TRANSACTIONS_BY_IDS_QUERY,
    variables: {
      ids: query.ids,
      first: ARWEAVE_GRAPHQL_PAGE_SIZE,
    },
  };
};

const describeCause = (cause: unknown): string =>
  cause instanceof Error ? cause.message : String(cause);

export interface ArweaveGraphQLOperations {
  /**
   * Fetches transactions tagged with the app name, oldest first. Profile
   * transactions share the app name tag and must be filtered by the caller.
   */
  readonly fetchPostTransactions: (options: {
    readonly minBlockHeight: number;
    readonly afterCursor?: string | undefined;
  }) => Effect.Effect<
    ReadonlyArray<ArweaveTransactionEdge>,
    ArweaveGraphQLError
  >;
  /** Fetches only profile metadata transactions, oldest first. */
  readonly fetchProfileTransactions: (options: {
    readonly minBlockHeight: number;
    readonly afterCursor?: string | undefined;
  }) => Effect.Effect<
    ReadonlyArray<ArweaveTransactionEdge>,
    ArweaveGraphQLError
  >;
  /**
   * Looks up the mined block of a single transaction. `None` means the
   * transaction is not mined yet or unknown to the gateway.
   */
  readonly fetchTransactionBlock: (
    txId: string,
  ) => Effect.Effect<
    Option.Option<ArweaveTransactionBlock>,
    ArweaveGraphQLError
  >;
}

export const makeArweaveGraphQLService = (
  http: HttpClient.HttpClient,
  appId: string,
  gatewayUrl: string,
): ArweaveGraphQLOperations => {
  const endpoint = `${gatewayUrl.replace(/\/+$/, "")}/graphql`;
  const client = HttpClient.filterStatusOk(http);

  const appNameTag: ArweaveTagFilter = {
    name: ArweaveTags.appName,
    values: [appId],
  };

  const execute = (
    query: ArweaveGraphQLQuery,
  ): Effect.Effect<
    ReadonlyArray<ArweaveTransactionEdge>,
    ArweaveGraphQLError
  > =>
    client
      .execute(
        HttpClientRequest.post(endpoint, {
          body: HttpBody.jsonUnsafe(encodeQuery(query)),
        }),
      )
      .pipe(
        Effect.mapError(
          (cause) =>
            new ArweaveGraphQLError({
              message: `Arweave GraphQL request failed: ${describeCause(cause)}`,
              cause,
            }),
        ),
        Effect.flatMap((response) =>
          HttpClientResponse.schemaBodyJson(TransactionsResponseSchema)(
            response,
          ).pipe(
            Effect.mapError(
              (cause) =>
                new ArweaveGraphQLError({
                  message: "Invalid Arweave GraphQL response",
                  cause,
                }),
            ),
          ),
        ),
        Effect.flatMap((decoded) => {
          if (decoded.errors !== undefined && decoded.errors.length > 0) {
            return Effect.fail(
              new ArweaveGraphQLError({
                message: `Arweave GraphQL error: ${decoded.errors
                  .map((error) => error.message)
                  .join(", ")}`,
                cause: undefined,
              }),
            );
          }

          return Effect.succeed(decoded.data?.transactions?.edges ?? []);
        }),
      );

  return {
    fetchPostTransactions: ({ minBlockHeight, afterCursor }) =>
      execute({
        kind: "transactionsByTags",
        tags: [appNameTag],
        minBlockHeight,
        after: afterCursor,
      }),
    fetchProfileTransactions: ({ minBlockHeight, afterCursor }) =>
      execute({
        kind: "transactionsByTags",
        tags: [
          appNameTag,
          {
            name: ArweaveTags.type,
            values: [ArweaveTransactionTypes.profile],
          },
        ],
        minBlockHeight,
        after: afterCursor,
      }),
    fetchTransactionBlock: (txId) =>
      execute({ kind: "transactionsByIds", ids: [txId] }).pipe(
        Effect.map((edges) =>
          Option.fromNullishOr(edges[0]?.node.block ?? null),
        ),
      ),
  };
};

export interface ArweaveGraphQLTestResponse {
  readonly status?: number | undefined;
  readonly body: Schema.Json;
}

export class ArweaveGraphQLService extends Context.Service<
  ArweaveGraphQLService,
  ArweaveGraphQLOperations
>()("sigle/ArweaveGraphQLService") {
  static readonly layer: Layer.Layer<
    ArweaveGraphQLService,
    never,
    AppConfig | HttpClient.HttpClient
  > = Layer.effect(
    ArweaveGraphQLService,
    Effect.gen(function* () {
      const config = yield* AppConfig;
      const http = yield* HttpClient.HttpClient;

      return makeArweaveGraphQLService(
        http,
        config.APP_ID,
        config.ARWEAVE_GATEWAY_URL,
      );
    }),
  );

  static readonly layerTest = (
    respond: (
      request: HttpClientRequest.HttpClientRequest,
    ) => ArweaveGraphQLTestResponse,
  ): Layer.Layer<ArweaveGraphQLService> =>
    Layer.succeed(
      ArweaveGraphQLService,
      makeArweaveGraphQLService(
        makeJsonHttpClient((request) => respond(request)),
        "sigle-test",
        "https://gateway.test",
      ),
    );
}
