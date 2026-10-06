import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Option } from "effect";
import { afterEach, vi } from "vitest";
import { AppConfig } from "@/config";
import {
  ArweaveGraphQLError,
  ArweaveGraphQLService,
  type ArweaveGraphQLQuery,
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

const stubFetchResponse = <T>(body: T, status = 200) => {
  const fetchMock = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
};

const productionLayer = ArweaveGraphQLService.layer.pipe(
  Layer.provide(
    AppConfig.layerTest({
      APP_ID: "sigle-test",
      ARWEAVE_GATEWAY_URL: "https://gateway.test/",
    }),
  ),
);

describe("arweave graphql service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.effect("fetches post transactions by app name tag", () => {
    const queries: Array<ArweaveGraphQLQuery> = [];

    const layer = ArweaveGraphQLService.layerTest((query) => {
      queries.push(query);

      return [makeEdge()];
    });

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      const edges = yield* graphql.fetchPostTransactions({
        minBlockHeight: 5,
      });

      expect(edges).toStrictEqual([makeEdge()]);
      expect(queries).toStrictEqual([
        {
          kind: "transactionsByTags",
          tags: [{ name: "App-Name", values: ["sigle-test"] }],
          minBlockHeight: 5,
          after: undefined,
        },
      ]);
    }).pipe(Effect.provide(layer));
  });

  it.effect("fetches profile transactions with the profile type tag", () => {
    const queries: Array<ArweaveGraphQLQuery> = [];

    const layer = ArweaveGraphQLService.layerTest((query) => {
      queries.push(query);

      return [];
    });

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      yield* graphql.fetchProfileTransactions({
        minBlockHeight: 0,
        afterCursor: "cursor-9",
      });

      expect(queries).toStrictEqual([
        {
          kind: "transactionsByTags",
          tags: [
            { name: "App-Name", values: ["sigle-test"] },
            { name: "Type", values: ["profile"] },
          ],
          minBlockHeight: 0,
          after: "cursor-9",
        },
      ]);
    }).pipe(Effect.provide(layer));
  });

  it.effect("posts the encoded query to the gateway and parses edges", () => {
    const fetchMock = stubFetchResponse({
      data: { transactions: { edges: [makeEdge()] } },
    });

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      const edges = yield* graphql.fetchPostTransactions({
        minBlockHeight: 5,
      });

      expect(edges).toStrictEqual([makeEdge()]);

      const [url, init] = fetchMock.mock.calls[0] ?? [];

      expect(url).toBe("https://gateway.test/graphql");
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toStrictEqual({
        query: expect.stringContaining("TransactionsByTags"),
        variables: {
          tags: [{ name: "App-Name", values: ["sigle-test"] }],
          minBlockHeight: 5,
          first: 100,
        },
      });
    }).pipe(Effect.provide(productionLayer));
  });

  it.effect("returns the mined block of a transaction", () => {
    const fetchMock = stubFetchResponse({
      data: { transactions: { edges: [makeEdge()] } },
    });

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      const block = yield* graphql.fetchTransactionBlock("tx-1");

      expect(Option.getOrNull(block)).toStrictEqual({
        height: 12,
        timestamp: 1_700_000_000,
      });

      const [, init] = fetchMock.mock.calls[0] ?? [];

      expect(JSON.parse(String(init?.body))).toStrictEqual({
        query: expect.stringContaining("TransactionsByIds"),
        variables: { ids: ["tx-1"], first: 100 },
      });
    }).pipe(Effect.provide(productionLayer));
  });

  it.effect("returns none when the transaction has no mined block", () => {
    stubFetchResponse({
      data: { transactions: { edges: [makeEdge({ block: null })] } },
    });

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      const block = yield* graphql.fetchTransactionBlock("tx-1");

      expect(Option.isNone(block)).toBe(true);
    }).pipe(Effect.provide(productionLayer));
  });

  it.effect("fails with ArweaveGraphQLError on graphql errors", () => {
    stubFetchResponse({ errors: [{ message: "boom" }] });

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      const error = yield* graphql
        .fetchPostTransactions({ minBlockHeight: 0 })
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(ArweaveGraphQLError);
      expect(error.message).toBe("Arweave GraphQL error: boom");
    }).pipe(Effect.provide(productionLayer));
  });

  it.effect("fails with ArweaveGraphQLError on non-ok responses", () => {
    stubFetchResponse({}, 500);

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      const error = yield* graphql
        .fetchPostTransactions({ minBlockHeight: 0 })
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(ArweaveGraphQLError);
      expect(error.message).toBe(
        "Arweave GraphQL request failed with status 500",
      );
    }).pipe(Effect.provide(productionLayer));
  });

  it.effect("fails with ArweaveGraphQLError on invalid response shapes", () => {
    stubFetchResponse({ data: { transactions: { edges: [{ cursor: 1 }] } } });

    return Effect.gen(function* () {
      const graphql = yield* ArweaveGraphQLService;

      const error = yield* graphql
        .fetchPostTransactions({ minBlockHeight: 0 })
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(ArweaveGraphQLError);
      expect(error.message).toBe("Invalid Arweave GraphQL response");
    }).pipe(Effect.provide(productionLayer));
  });
});
