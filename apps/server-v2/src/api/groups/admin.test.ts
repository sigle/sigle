import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/unstable/http";
import {
  createAuthenticatedClient,
  createTestWalletAddress,
} from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const ADMIN_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

const QueueListResponse = Schema.Struct({
  results: Schema.Array(Schema.Unknown),
});

const FailedJobListResponse = Schema.Struct({
  results: Schema.Array(Schema.Unknown),
  limit: Schema.Int,
  offset: Schema.Int,
  total: Schema.Int,
});

describe("admin jobs API", () => {
  it.effect("rejects unauthenticated requests", () =>
    Effect.gen(function* () {
      const response = yield* HttpClient.get("/api/protected/admin/queues");

      expect(response.status).toBe(401);
    }).pipe(
      Effect.provide(makeTestServerLayer({ ADMIN_ADDRESSES: [ADMIN_ADDRESS] })),
    ),
  );

  it.effect("rejects authenticated users without an admin wallet", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* client.get("/api/protected/admin/queues");

      expect(response.status).toBe(403);
    }).pipe(
      Effect.provide(makeTestServerLayer({ ADMIN_ADDRESSES: [ADMIN_ADDRESS] })),
    ),
  );

  it.effect("locks the admin API when no admin address is configured", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      yield* createTestWalletAddress({ userId, address: ADMIN_ADDRESS });

      const response = yield* client.get("/api/protected/admin/queues");

      expect(response.status).toBe(403);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("lists queues and failed jobs for an admin", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      yield* createTestWalletAddress({ userId, address: ADMIN_ADDRESS });

      const queues = yield* client.get("/api/protected/admin/queues");

      const queuesBody =
        yield* HttpClientResponse.schemaBodyJson(QueueListResponse)(queues);

      expect({
        status: queues.status,
        results: queuesBody.results,
      }).toStrictEqual({ status: 200, results: [] });

      const failed = yield* client.get(
        "/api/protected/admin/queues/publish-draft/failed?limit=10&offset=0",
      );

      const failedBody = yield* HttpClientResponse.schemaBodyJson(
        FailedJobListResponse,
      )(failed);

      expect({
        status: failed.status,
        results: failedBody.results,
        limit: failedBody.limit,
        offset: failedBody.offset,
        total: failedBody.total,
      }).toStrictEqual({
        status: 200,
        results: [],
        limit: 10,
        offset: 0,
        total: 0,
      });

      const retry = yield* client.execute(
        HttpClientRequest.post(
          "/api/protected/admin/queues/publish-draft/failed/unknown/retry",
        ),
      );

      expect(retry.status).toBe(404);

      const remove = yield* client.execute(
        HttpClientRequest.delete(
          "/api/protected/admin/queues/publish-draft/failed/unknown",
        ),
      );

      expect(remove.status).toBe(404);
    }).pipe(
      Effect.provide(makeTestServerLayer({ ADMIN_ADDRESSES: [ADMIN_ADDRESS] })),
    ),
  );
});
