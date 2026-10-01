import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Deferred, Effect, Option, Schema } from "effect";
import {
  Headers,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
import type { PostHogEvent } from "@/services/posthog";
import {
  Draft,
  DraftListResponse,
  PublishDraftAccepted,
  PublishDraftPayload,
  PublishDraftStatusResponse,
  UpdateDraftPayload,
} from "@/api/groups/drafts";
import { Database } from "@/db";
import { draft, post } from "@/db/schema";
import {
  ARWEAVE_TEST_UPLOAD,
  ARWEAVE_TEST_UPLOAD_ID,
  ArweaveUploadError,
} from "@/services/arweave";
import {
  createAuthenticatedClient,
  createSignedTestPostMetadata,
  createTestDraft,
  createTestPost,
  createTestSiwsCredentials,
  createTestWalletAddress,
} from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const ErrorResponse = Schema.Struct({ message: Schema.String });

const RawDraftListResponse = Schema.Struct({
  results: Schema.Array(Schema.Unknown),
  limit: Schema.Int,
  offset: Schema.Int,
  total: Schema.Int,
});

type DraftRequestBody = (typeof UpdateDraftPayload)["Encoded"];

const createDraftRequest = (
  client: HttpClient.HttpClient,
  body: DraftRequestBody = {},
) =>
  client.execute(
    HttpClientRequest.post("/api/protected/drafts").pipe(
      HttpClientRequest.bodyJsonUnsafe(body),
    ),
  );

const updateDraftRequest = (
  client: HttpClient.HttpClient,
  draftId: string,
  body: DraftRequestBody,
) =>
  client.execute(
    HttpClientRequest.patch(`/api/protected/drafts/${draftId}`).pipe(
      HttpClientRequest.bodyJsonUnsafe(body),
    ),
  );

const deleteDraftRequest = (client: HttpClient.HttpClient, draftId: string) =>
  client.execute(HttpClientRequest.delete(`/api/protected/drafts/${draftId}`));

const publishDraftRequest = (
  client: HttpClient.HttpClient,
  draftId: string,
  body: typeof PublishDraftPayload.Type,
) =>
  client.execute(
    HttpClientRequest.post(`/api/protected/drafts/${draftId}/publish`).pipe(
      HttpClientRequest.bodyJsonUnsafe(body),
    ),
  );

const getPublishStatusRequest = (
  client: HttpClient.HttpClient,
  draftId: string,
) => client.get(`/api/protected/drafts/${draftId}/publish`);

const waitForPublishStatus = (
  client: HttpClient.HttpClient,
  draftId: string,
  isDone: (status: typeof PublishDraftStatusResponse.Type) => boolean,
) =>
  Effect.gen(function* () {
    for (let attempt = 0; attempt < 200; attempt++) {
      const response = yield* getPublishStatusRequest(client, draftId);

      const status = yield* HttpClientResponse.schemaBodyJson(
        PublishDraftStatusResponse,
      )(response);

      if (isDone(status)) {
        return status;
      }

      yield* Effect.sleep("20 millis");
    }

    return yield* Effect.die(
      new Error(`timed out waiting for publish status on ${draftId}`),
    );
  });

describe("drafts", () => {
  it.effect("POST /api/protected/drafts creates a draft", () => {
    const events: Array<PostHogEvent> = [];

    return Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      const db = yield* Database;

      const response = yield* createDraftRequest(client);

      const body = yield* HttpClientResponse.schemaBodyJson(Draft)(response);

      const [created] = yield* db
        .select()
        .from(draft)
        .where(eq(draft.id, body.id));

      expect(response.status).toBe(201);
      expect(
        Option.getOrUndefined(Headers.get(response.headers, "location")),
      ).toBe(`/api/protected/drafts/${body.id}`);
      expect(body).toMatchObject({
        title: "",
        content: "",
        metaTitle: null,
        metaDescription: null,
        coverImage: null,
        tags: [],
        canonicalUri: null,
      });
      expect(created).toMatchObject({
        id: body.id,
        userId,
        title: "",
        content: "",
      });
      expect(events).toStrictEqual([
        {
          distinctId: userId,
          event: "draft created",
          properties: { postId: body.id },
        },
      ]);
    }).pipe(Effect.provide(makeTestServerLayer({}, events)));
  });

  it.effect("POST /api/protected/drafts accepts initial fields", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* createDraftRequest(client, {
        title: "Hello",
        content: "World",
        metaTitle: "Meta title",
        metaDescription: "Meta description",
        coverImage: "cover.png",
        tags: ["stacks", "writing"],
        canonicalUri: "https://example.com/post",
      });

      const body = yield* HttpClientResponse.schemaBodyJson(Draft)(response);

      expect(response.status).toBe(201);
      expect(body).toMatchObject({
        title: "Hello",
        content: "World",
        metaTitle: "Meta title",
        metaDescription: "Meta description",
        coverImage: "cover.png",
        tags: ["stacks", "writing"],
        canonicalUri: "https://example.com/post",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/protected/drafts returns the list envelope", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      yield* createTestDraft({
        id: "draft-1",
        userId,
        title: "Draft 1",
        content: "Secret content",
      });
      yield* createTestDraft({ id: "draft-2", userId, title: "Draft 2" });
      const response = yield* client.get("/api/protected/drafts");

      const rawJson = yield* response.json;

      const raw =
        yield* Schema.decodeUnknownEffect(RawDraftListResponse)(rawJson);

      const body =
        yield* Schema.decodeUnknownEffect(DraftListResponse)(rawJson);

      expect(response.status).toBe(200);
      expect(body).toMatchObject({ limit: 20, offset: 0, total: 2 });
      expect(body.results.map((item) => item.id).sort()).toStrictEqual([
        "draft-1",
        "draft-2",
      ]);
      expect(raw.results[0]).not.toHaveProperty("content");
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/protected/drafts paginates with limit and offset", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      yield* createTestDraft({
        id: "draft-1",
        userId,
        updatedAt: new Date("2026-01-01T00:00:01.000Z"),
      });
      yield* createTestDraft({
        id: "draft-2",
        userId,
        updatedAt: new Date("2026-01-01T00:00:02.000Z"),
      });
      yield* createTestDraft({
        id: "draft-3",
        userId,
        updatedAt: new Date("2026-01-01T00:00:03.000Z"),
      });

      const first = yield* client.get("/api/protected/drafts?limit=2");

      const second = yield* client.get(
        "/api/protected/drafts?limit=2&offset=2",
      );

      const firstBody =
        yield* HttpClientResponse.schemaBodyJson(DraftListResponse)(first);

      const secondBody =
        yield* HttpClientResponse.schemaBodyJson(DraftListResponse)(second);

      expect(firstBody.results.map((item) => item.id)).toStrictEqual([
        "draft-3",
        "draft-2",
      ]);
      expect(firstBody.total).toBe(3);
      expect(secondBody.results.map((item) => item.id)).toStrictEqual([
        "draft-1",
      ]);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/protected/drafts validates the query", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const zero = yield* client.get("/api/protected/drafts?limit=0");
      const tooBig = yield* client.get("/api/protected/drafts?limit=101");

      const fractionalLimit = yield* client.get(
        "/api/protected/drafts?limit=2.5",
      );

      const negativeOffset = yield* client.get(
        "/api/protected/drafts?offset=-1",
      );

      const fractionalOffset = yield* client.get(
        "/api/protected/drafts?offset=0.5",
      );

      expect([
        zero.status,
        tooBig.status,
        fractionalLimit.status,
        negativeOffset.status,
        fractionalOffset.status,
      ]).toStrictEqual([400, 400, 400, 400, 400]);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/protected/drafts/:draftId returns draft by id", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      yield* createTestDraft({
        id: "draft-1",
        userId,
        title: "Test Draft",
      });

      const response = yield* client.get("/api/protected/drafts/draft-1");

      const body = yield* HttpClientResponse.schemaBodyJson(Draft)(response);

      expect(response.status).toBe(200);
      expect(body).toMatchObject({
        id: "draft-1",
        title: "Test Draft",
        content: "Test content",
        tags: [],
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "GET /api/protected/drafts/:draftId returns 404 when not found",
    () =>
      Effect.gen(function* () {
        const { client } = yield* createAuthenticatedClient();

        const response = yield* client.get(
          "/api/protected/drafts/non-existent",
        );

        const body =
          yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

        expect(response.status).toBe(404);
        expect(body.message).toBe("Draft not found");
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("draft routes are scoped to the current user", () =>
    Effect.gen(function* () {
      const first = yield* createAuthenticatedClient();
      const second = yield* createAuthenticatedClient();

      yield* createTestDraft({ id: "draft-1", userId: first.userId });

      const get = yield* second.client.get("/api/protected/drafts/draft-1");

      const update = yield* updateDraftRequest(second.client, "draft-1", {
        title: "Hijacked",
      });

      const remove = yield* deleteDraftRequest(second.client, "draft-1");

      expect([get.status, update.status, remove.status]).toStrictEqual([
        404, 404, 404,
      ]);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "PATCH /api/protected/drafts/:draftId partially updates a draft",
    () =>
      Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        const db = yield* Database;

        yield* createTestDraft({
          id: "draft-1",
          userId,
          title: "Old title",
          content: "Old content",
        });

        const response = yield* updateDraftRequest(client, "draft-1", {
          content: "New content",
        });

        const body = yield* HttpClientResponse.schemaBodyJson(Draft)(response);

        expect(response.status).toBe(200);
        expect(body).toMatchObject({
          id: "draft-1",
          title: "Old title",
          content: "New content",
        });

        const [updated] = yield* db
          .select()
          .from(draft)
          .where(eq(draft.id, "draft-1"));

        expect(updated).toMatchObject({
          title: "Old title",
          content: "New content",
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("PATCH /api/protected/drafts/:draftId clears nullable fields", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const created = yield* createDraftRequest(client, {
        title: "Title",
        content: "Content",
        metaTitle: "Meta title",
        metaDescription: "Meta description",
        coverImage: "cover.png",
        canonicalUri: "https://example.com/post",
      });

      const createdBody =
        yield* HttpClientResponse.schemaBodyJson(Draft)(created);

      const response = yield* updateDraftRequest(client, createdBody.id, {
        metaTitle: null,
        metaDescription: null,
        coverImage: null,
        canonicalUri: null,
      });

      const body = yield* HttpClientResponse.schemaBodyJson(Draft)(response);

      expect(response.status).toBe(200);
      expect(body).toMatchObject({
        title: "Title",
        content: "Content",
        metaTitle: null,
        metaDescription: null,
        coverImage: null,
        canonicalUri: null,
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "PATCH /api/protected/drafts/:draftId returns 404 when not found",
    () =>
      Effect.gen(function* () {
        const { client } = yield* createAuthenticatedClient();

        const response = yield* updateDraftRequest(client, "non-existent", {
          title: "Title",
        });

        expect(response.status).toBe(404);
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("DELETE /api/protected/drafts/:draftId deletes a draft", () => {
    const events: Array<PostHogEvent> = [];

    return Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      const db = yield* Database;

      yield* createTestDraft({
        id: "draft-1",
        userId,
        title: "To delete",
      });

      const response = yield* deleteDraftRequest(client, "draft-1");

      expect(response.status).toBe(204);
      expect(yield* response.text).toBe("");

      const [deleted] = yield* db
        .select()
        .from(draft)
        .where(eq(draft.id, "draft-1"));

      expect(deleted).toBeUndefined();
      expect(events).toStrictEqual([
        {
          distinctId: userId,
          event: "draft deleted",
          properties: { draftId: "draft-1" },
        },
      ]);
    }).pipe(Effect.provide(makeTestServerLayer({}, events)));
  });

  it.effect(
    "DELETE /api/protected/drafts/:draftId returns 404 when not found",
    () =>
      Effect.gen(function* () {
        const { client } = yield* createAuthenticatedClient();

        const response = yield* deleteDraftRequest(client, "non-existent");

        expect(response.status).toBe(404);
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "POST /api/protected/drafts/:draftId/publish validates draft existence, metadata, signature, wallet ownership, and replay",
    () =>
      Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        const ownerWallet = createTestSiwsCredentials("testnet");
        const otherWallet = createTestSiwsCredentials("testnet");

        yield* createTestWalletAddress({
          userId,
          address: ownerWallet.address,
        });
        yield* createTestDraft({ id: "draft-val", userId });

        // 1. Non-existent draft -> 404 Not Found
        const missingDraftRes = yield* publishDraftRequest(
          client,
          "missing-draft",
          {
            metadata: createSignedTestPostMetadata({
              draftId: "missing-draft",
              privateKey: ownerWallet.privateKey,
            }),
          },
        );

        expect(missingDraftRes.status).toBe(404);

        // 2. Invalid metadata schema -> 400 Bad Request
        const invalidMetaRes = yield* publishDraftRequest(client, "draft-val", {
          metadata: { invalid: true },
        });

        expect(invalidMetaRes.status).toBe(400);

        // 3. Metadata content id not matching the draft -> 400 Bad Request
        const mismatchedIdRes = yield* publishDraftRequest(
          client,
          "draft-val",
          {
            metadata: createSignedTestPostMetadata({
              draftId: "other-draft",
              privateKey: ownerWallet.privateKey,
            }),
          },
        );

        expect(mismatchedIdRes.status).toBe(400);

        // 4. Signed by wallet not belonging to user -> 400 Bad Request
        const wrongWalletRes = yield* publishDraftRequest(client, "draft-val", {
          metadata: createSignedTestPostMetadata({
            draftId: "draft-val",
            privateKey: otherWallet.privateKey,
          }),
        });

        expect(wrongWalletRes.status).toBe(400);

        // 5. Already published signature -> 400 Bad Request
        const validSigned = createSignedTestPostMetadata({
          draftId: "draft-val",
          privateKey: ownerWallet.privateKey,
        });

        yield* createTestPost({
          id: "existing-post-id",
          userId,
          signature: validSigned.signature,
        });

        const duplicateSigRes = yield* publishDraftRequest(
          client,
          "draft-val",
          {
            metadata: validSigned,
          },
        );

        expect(duplicateSigRes.status).toBe(400);
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.live(
    "POST & GET /api/protected/drafts/:draftId/publish enqueues and completes publishing",
    () => {
      const events: Array<PostHogEvent> = [];

      return Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        const db = yield* Database;
        const ownerWallet = createTestSiwsCredentials("testnet");

        yield* createTestWalletAddress({
          userId,
          address: ownerWallet.address,
        });
        yield* createTestDraft({ id: "draft-pub-1", userId });

        // Status before publishing has been started -> 400 Bad Request
        const unstartedRes = yield* getPublishStatusRequest(
          client,
          "draft-pub-1",
        );

        // Enqueue publish job
        const publishRes = yield* publishDraftRequest(client, "draft-pub-1", {
          metadata: createSignedTestPostMetadata({
            draftId: "draft-pub-1",
            privateKey: ownerWallet.privateKey,
          }),
        });

        const publishBody =
          yield* HttpClientResponse.schemaBodyJson(PublishDraftAccepted)(
            publishRes,
          );

        const currentStatus = yield* waitForPublishStatus(
          client,
          "draft-pub-1",
          (status) => status.status === "COMPLETED",
        );

        const [deletedDraft] = yield* db
          .select()
          .from(draft)
          .where(eq(draft.id, "draft-pub-1"));

        const [createdPost] = yield* db
          .select()
          .from(post)
          .where(eq(post.draftId, "draft-pub-1"));

        expect({
          unstartedStatus: unstartedRes.status,
          publishStatus: publishRes.status,
          publishBody,
          currentStatus,
          deletedDraft,
          createdPostId: createdPost.id,
          createdPostArweaveId: createdPost.arweaveTxId,
        }).toStrictEqual({
          unstartedStatus: 400,
          publishStatus: 202,
          publishBody: {
            draftId: "draft-pub-1",
            status: "PENDING",
          },
          currentStatus: {
            status: "COMPLETED",
            postId: ARWEAVE_TEST_UPLOAD_ID,
            arweaveId: ARWEAVE_TEST_UPLOAD_ID,
          },
          deletedDraft: undefined,
          createdPostId: ARWEAVE_TEST_UPLOAD_ID,
          createdPostArweaveId: ARWEAVE_TEST_UPLOAD_ID,
        });

        expect(events).toContainEqual({
          distinctId: userId,
          event: "draft published",
          properties: {
            draftId: "draft-pub-1",
            postId: ARWEAVE_TEST_UPLOAD_ID,
            arweaveId: ARWEAVE_TEST_UPLOAD_ID,
          },
        });
      }).pipe(Effect.provide(makeTestServerLayer({}, events)));
    },
  );

  it.live(
    "GET /api/protected/drafts/:draftId/publish reports FAILED when upload fails and allows retry via POST",
    () =>
      Effect.gen(function* () {
        let shouldFail = true;
        const failedSignal = yield* Deferred.make<void>();
        let attempts = 0;

        const layer = makeTestServerLayer({}, [], {
          arweaveUploadImpl: () =>
            Effect.gen(function* () {
              attempts++;

              if (shouldFail) {
                if (attempts >= 2) {
                  yield* Deferred.succeed(failedSignal, undefined);
                }

                return yield* new ArweaveUploadError({
                  cause: new Error("Arweave unavailable"),
                  message: "Arweave unavailable",
                });
              }

              return { ...ARWEAVE_TEST_UPLOAD, id: "recovered-arweave-tx" };
            }),
        });

        yield* Effect.gen(function* () {
          const { client, userId } = yield* createAuthenticatedClient();
          const ownerWallet = createTestSiwsCredentials("testnet");

          yield* createTestWalletAddress({
            userId,
            address: ownerWallet.address,
          });
          yield* createTestDraft({ id: "draft-flaky", userId });

          const signedMetadata = createSignedTestPostMetadata({
            draftId: "draft-flaky",
            privateKey: ownerWallet.privateKey,
          });

          const firstRes = yield* publishDraftRequest(client, "draft-flaky", {
            metadata: signedMetadata,
          });

          expect(firstRes.status).toBe(202);

          yield* Deferred.await(failedSignal);

          const failedStatus = yield* waitForPublishStatus(
            client,
            "draft-flaky",
            (status) => status.status === "FAILED",
          );

          expect(failedStatus).toStrictEqual({
            status: "FAILED",
            postId: null,
            arweaveId: null,
          });

          // Now recover Arweave and re-trigger publish via POST
          shouldFail = false;

          const retryRes = yield* publishDraftRequest(client, "draft-flaky", {
            metadata: signedMetadata,
          });

          expect(retryRes.status).toBe(202);

          const finalStatus = yield* waitForPublishStatus(
            client,
            "draft-flaky",
            (status) => status.status === "COMPLETED",
          );

          expect(finalStatus).toStrictEqual({
            status: "COMPLETED",
            postId: "recovered-arweave-tx",
            arweaveId: "recovered-arweave-tx",
          });
        }).pipe(Effect.provide(layer));
      }),
  );

  it.live(
    "POST /api/protected/drafts/:draftId/publish recovers a draft with a stale in-flight status",
    () =>
      Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        const db = yield* Database;
        const ownerWallet = createTestSiwsCredentials("testnet");

        yield* createTestWalletAddress({
          userId,
          address: ownerWallet.address,
        });
        // A checkpoint without a live queue job (e.g. the FAILED write failed)
        // which used to block re-publishing forever.
        yield* createTestDraft({
          id: "draft-stuck",
          userId,
          txStatus: "PENDING",
          arweaveTxId: "stale-arweave-tx",
        });

        const publishRes = yield* publishDraftRequest(client, "draft-stuck", {
          metadata: createSignedTestPostMetadata({
            draftId: "draft-stuck",
            privateKey: ownerWallet.privateKey,
          }),
        });

        expect(publishRes.status).toBe(202);

        const status = yield* waitForPublishStatus(
          client,
          "draft-stuck",
          (current) => current.status === "COMPLETED",
        );

        const [createdPost] = yield* db
          .select()
          .from(post)
          .where(eq(post.draftId, "draft-stuck"));

        expect({
          status: status.status,
          arweaveId: createdPost.arweaveTxId,
        }).toStrictEqual({
          status: "COMPLETED",
          arweaveId: ARWEAVE_TEST_UPLOAD_ID,
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("draft routes return 401 without a session", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const responses = yield* Effect.all([
        createDraftRequest(client),
        client.get("/api/protected/drafts"),
        client.get("/api/protected/drafts/draft-1"),
        updateDraftRequest(client, "draft-1", { title: "Title" }),
        deleteDraftRequest(client, "draft-1"),
        publishDraftRequest(client, "draft-1", {
          metadata: {},
        }),
        getPublishStatusRequest(client, "draft-1"),
      ]);

      expect(responses.map((response) => response.status)).toStrictEqual([
        401, 401, 401, 401, 401, 401, 401,
      ]);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );
});

describe("update draft payload", () => {
  it("treats omitted fields as unchanged", () => {
    const decoded = Schema.decodeSync(UpdateDraftPayload)({});

    expect(decoded).toStrictEqual({});
  });

  it("clears nullable fields with null", () => {
    const decoded = Schema.decodeSync(UpdateDraftPayload)({
      metaTitle: null,
      coverImage: null,
      tags: [],
      canonicalUri: null,
    });

    expect(decoded).toStrictEqual({
      metaTitle: null,
      coverImage: null,
      tags: [],
      canonicalUri: null,
    });
  });

  it("rejects null for non-nullable fields", () => {
    expect(() =>
      Schema.decodeUnknownSync(UpdateDraftPayload)({ title: null }),
    ).toThrow("Expected string");
  });
});
