import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "effect/http";
import { SqlClient } from "effect/sql";
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
      const response = yield* HttpClient.get("/api/admin/queues");

      expect(response.status).toBe(401);
    }).pipe(
      Effect.provide(makeTestServerLayer({ ADMIN_ADDRESSES: [ADMIN_ADDRESS] })),
    ),
  );

  it.effect("rejects authenticated users without an admin wallet", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* client.get("/api/admin/queues");

      expect(response.status).toBe(403);
    }).pipe(
      Effect.provide(makeTestServerLayer({ ADMIN_ADDRESSES: [ADMIN_ADDRESS] })),
    ),
  );

  it.effect("locks the admin API when no admin address is configured", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      yield* createTestWalletAddress({ userId, address: ADMIN_ADDRESS });

      const response = yield* client.get("/api/admin/queues");

      expect(response.status).toBe(403);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("lists queues and failed jobs for an admin", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      yield* createTestWalletAddress({ userId, address: ADMIN_ADDRESS });
      const sql = (yield* SqlClient.SqlClient).withoutTransforms();

      // One failed job in a queue that has rows; the other queues have none.
      yield* sql`
        INSERT INTO effect_queue
          (id, queue_name, element, state, attempts, created_at, updated_at, visible_at)
        VALUES
          ('job-1', 'publish-draft', '{}', 'failed', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      const queues = yield* client.get("/api/admin/queues");

      const queuesBody =
        yield* HttpClientResponse.schemaBodyJson(QueueListResponse)(queues);

      const emptyQueue = (queueName: string) => ({
        queueName,
        pending: 0,
        active: 0,
        completed: 0,
        failed: 0,
        oldestPendingAgeMillis: null,
      });

      expect({
        status: queues.status,
        results: queuesBody.results,
      }).toStrictEqual({
        status: 200,
        results: [
          emptyQueue("generate-image-thumbhash"),
          emptyQueue("opentimestamps-stamp"),
          emptyQueue("opentimestamps-upgrade"),
          { ...emptyQueue("publish-draft"), failed: 1 },
        ],
      });

      const failed = yield* client.get(
        "/api/admin/queues/publish-draft/failed?limit=10&offset=0",
      );

      const failedBody = yield* HttpClientResponse.schemaBodyJson(
        FailedJobListResponse,
      )(failed);

      expect({
        status: failed.status,
        results: failedBody.results.length,
        limit: failedBody.limit,
        offset: failedBody.offset,
        total: failedBody.total,
      }).toStrictEqual({
        status: 200,
        results: 1,
        limit: 10,
        offset: 0,
        total: 1,
      });

      const retry = yield* client.execute(
        HttpClientRequest.post(
          "/api/admin/queues/publish-draft/failed/unknown/retry",
        ),
      );

      expect(retry.status).toBe(404);

      const remove = yield* client.execute(
        HttpClientRequest.delete(
          "/api/admin/queues/publish-draft/failed/unknown",
        ),
      );

      expect(remove.status).toBe(404);
    }).pipe(
      Effect.provide(makeTestServerLayer({ ADMIN_ADDRESSES: [ADMIN_ADDRESS] })),
    ),
  );

  it.effect("retries a failed job with an empty 204", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      yield* createTestWalletAddress({ userId, address: ADMIN_ADDRESS });
      const sql = (yield* SqlClient.SqlClient).withoutTransforms();

      yield* sql`
        INSERT INTO effect_queue
          (id, queue_name, element, state, attempts, created_at, updated_at, visible_at)
        VALUES
          ('job-1', 'publish-draft', '{}', 'failed', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      const retry = yield* client.execute(
        HttpClientRequest.post(
          "/api/admin/queues/publish-draft/failed/job-1/retry",
        ),
      );

      expect({
        status: retry.status,
        body: yield* retry.text,
      }).toStrictEqual({ status: 204, body: "" });
    }).pipe(
      Effect.provide(makeTestServerLayer({ ADMIN_ADDRESSES: [ADMIN_ADDRESS] })),
    ),
  );

  it.effect("rejects unknown queue names with a 400", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      yield* createTestWalletAddress({ userId, address: ADMIN_ADDRESS });

      const responses = yield* Effect.all([
        client.get("/api/admin/queues/publish-drafts/failed"),
        client.execute(
          HttpClientRequest.post(
            "/api/admin/queues/publish-drafts/failed/job-1/retry",
          ),
        ),
        client.execute(
          HttpClientRequest.delete(
            "/api/admin/queues/publish-drafts/failed/job-1",
          ),
        ),
      ]);

      expect(responses.map((response) => response.status)).toStrictEqual([
        400, 400, 400,
      ]);
    }).pipe(
      Effect.provide(makeTestServerLayer({ ADMIN_ADDRESSES: [ADMIN_ADDRESS] })),
    ),
  );
});
