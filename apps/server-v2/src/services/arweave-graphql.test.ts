import type { HttpClientRequest } from "effect/http";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Option, Schema } from "effect";
import {
  ArweaveGraphQLError,
  ArweaveGraphQLService,
  type ArweaveGraphQLTestResponse,
  type ArweaveTransactionEdge,
} from "@/services/arweave-graphql";

const makeEdge = (
  overrides: Partial<ArweaveTransactionEdge["node"]> = {},
  cursor = "cursor-1",
): ArweaveTransactionEdge => ({
  cursor,
  node: {
    id: "tx-1",
    block: { height: 12, timestamp: 1_700_000_000 },
    ...overrides,
  },
});

const RequestBodySchema = Schema.Struct({
  query: Schema.String,
  variables: Schema.Struct({
    tags: Schema.optionalKey(
      Schema.Array(
        Schema.Struct({
          name: Schema.String,
          values: Schema.Array(Schema.String),
        }),
      ),
    ),
    ids: Schema.optionalKey(Schema.Array(Schema.String)),
    minBlockHeight: Schema.optionalKey(Schema.Finite),
    after: Schema.optionalKey(Schema.String),
    first: Schema.optionalKey(Schema.Finite),
  }),
});

const RequestBodyJsonSchema = Schema.fromJsonString(RequestBodySchema);

const EncodedBodySchema = Schema.Struct({
  body: Schema.optionalKey(Schema.String),
});

const requestBody = (request: HttpClientRequest.HttpClientRequest) => {
  const encoded = Schema.decodeUnknownSync(EncodedBodySchema)(
    request.body.toJSON(),
  );

  return Schema.decodeSync(RequestBodyJsonSchema)(encoded.body ?? "null");
};

const respondWithEdges = (
  edges: ReadonlyArray<ArweaveTransactionEdge>,
): ArweaveGraphQLTestResponse => ({
  body: { data: { transactions: { edges } } },
});

describe("arweave graphql service", () => {
  it.effect("fetches post transactions by app name tag", () => {
    const requests: Array<ReturnType<typeof requestBody>> = [];

    const layer = ArweaveGraphQLService.layerTest((request) => {
      requests.push(requestBody(request));

      return respondWithEdges([makeEdge()]);
    });

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      const edges = yield* graphql.fetchPostTransactions({
        minBlockHeight: 5,
      });

      expect(edges).toStrictEqual([makeEdge()]);
      expect(requests[0]?.variables).toStrictEqual({
        tags: [{ name: "App-Name", values: ["sigle-test"] }],
        minBlockHeight: 5,
        first: 100,
      });
      expect(requests[0]?.query).toContain("TransactionsByTags");
    }).pipe(Effect.provide(layer));
  });

  it.effect("fetches profile transactions with the profile type tag", () => {
    const requests: Array<ReturnType<typeof requestBody>> = [];

    const layer = ArweaveGraphQLService.layerTest((request) => {
      requests.push(requestBody(request));

      return respondWithEdges([]);
    });

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      yield* graphql.fetchProfileTransactions({
        minBlockHeight: 0,
        afterCursor: "cursor-9",
      });

      expect(requests[0]?.variables).toStrictEqual({
        tags: [
          { name: "App-Name", values: ["sigle-test"] },
          { name: "Type", values: ["profile"] },
        ],
        minBlockHeight: 0,
        after: "cursor-9",
        first: 100,
      });
    }).pipe(Effect.provide(layer));
  });

  it.effect("returns the mined block of a transaction", () => {
    const requests: Array<ReturnType<typeof requestBody>> = [];

    const layer = ArweaveGraphQLService.layerTest((request) => {
      requests.push(requestBody(request));

      return respondWithEdges([makeEdge()]);
    });

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      const block = yield* graphql.fetchTransactionBlock("tx-1");

      expect(Option.getOrNull(block)).toStrictEqual({
        height: 12,
        timestamp: 1_700_000_000,
      });
      expect(requests[0]?.variables).toStrictEqual({
        ids: ["tx-1"],
        first: 100,
      });
      expect(requests[0]?.query).toContain("TransactionsByIds");
    }).pipe(Effect.provide(layer));
  });

  it.effect("returns none when the transaction has no mined block", () => {
    const layer = ArweaveGraphQLService.layerTest(() =>
      respondWithEdges([makeEdge({ block: null })]),
    );

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      const block = yield* graphql.fetchTransactionBlock("tx-1");

      expect(Option.isNone(block)).toBe(true);
    }).pipe(Effect.provide(layer));
  });

  it.effect("fails with ArweaveGraphQLError on graphql errors", () => {
    const layer = ArweaveGraphQLService.layerTest(() => ({
      body: { errors: [{ message: "boom" }] },
    }));

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      const error = yield* graphql
        .fetchPostTransactions({ minBlockHeight: 0 })
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(ArweaveGraphQLError);
      expect(error.message).toBe("Arweave GraphQL error: boom");
    }).pipe(Effect.provide(layer));
  });

  it.effect("fails with ArweaveGraphQLError on non-ok responses", () => {
    const layer = ArweaveGraphQLService.layerTest(() => ({
      status: 500,
      body: {},
    }));

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      const error = yield* graphql
        .fetchPostTransactions({ minBlockHeight: 0 })
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(ArweaveGraphQLError);
      expect(error.message).toContain("Arweave GraphQL request failed");
    }).pipe(Effect.provide(layer));
  });

  it.effect("fails with ArweaveGraphQLError on invalid response shapes", () => {
    const layer = ArweaveGraphQLService.layerTest(() => ({
      body: { data: { transactions: { edges: [{ cursor: 1 }] } } },
    }));

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      const error = yield* graphql
        .fetchPostTransactions({ minBlockHeight: 0 })
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(ArweaveGraphQLError);
      expect(error.message).toBe("Invalid Arweave GraphQL response");
    }).pipe(Effect.provide(layer));
  });
});
