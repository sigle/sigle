import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Deferred, Effect, Exit, Layer, Option, Schema, Stream } from "effect";
import {
  Headers,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
import sharp from "sharp";
import type { PostHogEvent } from "@/services/posthog";
import {
  CreateDraftPayload,
  Draft,
  DRAFT_LIMITS,
  DraftListResponse,
  PublishDraftAccepted,
  PublishDraftStatusResponse,
  UpdateDraftPayload,
  UploadDraftImageResponse,
} from "@/api/groups/drafts";
import { Database } from "@/db";
import { draft, mediaImage, post, postOts } from "@/db/schema";
import { sha256Hex } from "@/lib/hash";
import { ImageOptimizationError, optimizeImage } from "@/lib/images";
import {
  ARWEAVE_TEST_UPLOAD,
  ARWEAVE_TEST_UPLOAD_ID,
  ArweaveService,
  type ArweaveUploadOptions,
  ArweaveUploadError,
} from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import {
  makeStorageTestRecorder,
  STORAGE_TEST_PUBLIC_URL,
  StorageService,
  type StorageTestRecorder,
} from "@/services/storage";
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
    HttpClientRequest.post("/api/drafts").pipe(
      HttpClientRequest.bodyJsonUnsafe(body),
    ),
  );

const updateDraftRequest = (
  client: HttpClient.HttpClient,
  draftId: string,
  body: DraftRequestBody,
) =>
  client.execute(
    HttpClientRequest.patch(`/api/drafts/${draftId}`).pipe(
      HttpClientRequest.bodyJsonUnsafe(body),
    ),
  );

const deleteDraftRequest = (client: HttpClient.HttpClient, draftId: string) =>
  client.execute(HttpClientRequest.delete(`/api/drafts/${draftId}`));

const publishDraftRequest = (
  client: HttpClient.HttpClient,
  draftId: string,
  // Untyped so tests can send payloads the schema rejects.
  body: { readonly metadata: unknown },
) =>
  client.execute(
    HttpClientRequest.post(`/api/drafts/${draftId}/publish`).pipe(
      HttpClientRequest.bodyJsonUnsafe(body),
    ),
  );

const getPublishStatusRequest = (
  client: HttpClient.HttpClient,
  draftId: string,
) => client.get(`/api/drafts/${draftId}/publish`);

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

const waitForPostOtsStatus = (postId: string, status: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    for (let attempt = 0; attempt < 200; attempt++) {
      const [row] = yield* db
        .select({ status: postOts.status, otsTxId: postOts.otsTxId })
        .from(postOts)
        .where(eq(postOts.postId, postId))
        .limit(1)
        .pipe(Effect.orDie);

      if (row?.status === status) {
        return row;
      }

      yield* Effect.sleep("20 millis");
    }

    return yield* Effect.die(
      new Error(`timed out waiting for post_ots ${postId} to be ${status}`),
    );
  });

describe("drafts", () => {
  it.effect("POST /api/drafts creates a draft", () => {
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
      ).toBe(`/api/drafts/${body.id}`);
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
          properties: { draftId: body.id },
        },
      ]);
    }).pipe(Effect.provide(makeTestServerLayer({}, events)));
  });

  it.effect("POST /api/drafts accepts initial fields", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* createDraftRequest(client, {
        title: "Hello",
        content: "World",
        metaTitle: "Meta title",
        metaDescription: "Meta description",
        coverImage: "https://cdn.test/cover.png",
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
        coverImage: "https://cdn.test/cover.png",
        tags: ["stacks", "writing"],
        canonicalUri: "https://example.com/post",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/drafts returns the list envelope", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      yield* createTestDraft({
        id: "draft-1",
        userId,
        title: "Draft 1",
        content: "Secret content",
      });
      yield* createTestDraft({ id: "draft-2", userId, title: "Draft 2" });
      const response = yield* client.get("/api/drafts");

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

  it.effect("GET /api/drafts paginates with limit and offset", () =>
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

      const first = yield* client.get("/api/drafts?limit=2");

      const second = yield* client.get("/api/drafts?limit=2&offset=2");

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

  it.effect("GET /api/drafts validates the query", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const zero = yield* client.get("/api/drafts?limit=0");
      const tooBig = yield* client.get("/api/drafts?limit=101");

      const fractionalLimit = yield* client.get("/api/drafts?limit=2.5");

      const negativeOffset = yield* client.get("/api/drafts?offset=-1");

      const fractionalOffset = yield* client.get("/api/drafts?offset=0.5");

      expect([
        zero.status,
        tooBig.status,
        fractionalLimit.status,
        negativeOffset.status,
        fractionalOffset.status,
      ]).toStrictEqual([400, 400, 400, 400, 400]);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/drafts/:draftId returns draft by id", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      yield* createTestDraft({
        id: "draft-1",
        userId,
        title: "Test Draft",
      });

      const response = yield* client.get("/api/drafts/draft-1");

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

  it.effect("GET /api/drafts/:draftId returns 404 when not found", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* client.get("/api/drafts/non-existent");

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

      const get = yield* second.client.get("/api/drafts/draft-1");

      const update = yield* updateDraftRequest(second.client, "draft-1", {
        title: "Hijacked",
      });

      const remove = yield* deleteDraftRequest(second.client, "draft-1");

      expect([get.status, update.status, remove.status]).toStrictEqual([
        404, 404, 404,
      ]);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("PATCH /api/drafts/:draftId partially updates a draft", () =>
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

  it.effect("PATCH /api/drafts/:draftId clears nullable fields", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const created = yield* createDraftRequest(client, {
        title: "Title",
        content: "Content",
        metaTitle: "Meta title",
        metaDescription: "Meta description",
        coverImage: "https://cdn.test/cover.png",
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
    "PATCH /api/drafts/:draftId with an empty body changes nothing",
    () =>
      Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        const db = yield* Database;
        const updatedAt = new Date("2026-01-01T00:00:00.000Z");

        yield* createTestDraft({
          id: "draft-1",
          userId,
          title: "Title",
          updatedAt,
        });

        const response = yield* updateDraftRequest(client, "draft-1", {});
        const missing = yield* updateDraftRequest(client, "missing", {});
        const body = yield* HttpClientResponse.schemaBodyJson(Draft)(response);

        const [stored] = yield* db
          .select({ updatedAt: draft.updatedAt })
          .from(draft)
          .where(eq(draft.id, "draft-1"));

        expect({
          status: response.status,
          title: body.title,
          storedUpdatedAt: stored?.updatedAt.toISOString(),
          missingStatus: missing.status,
        }).toStrictEqual({
          status: 200,
          title: "Title",
          storedUpdatedAt: updatedAt.toISOString(),
          missingStatus: 404,
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("PATCH /api/drafts/:draftId returns 404 when not found", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* updateDraftRequest(client, "non-existent", {
        title: "Title",
      });

      expect(response.status).toBe(404);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("PATCH /api/drafts/:draftId rejects updates while publishing", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      const db = yield* Database;

      const results = yield* Effect.forEach(
        ["PENDING", "PROCESSING", "FAILED"] as const,
        (txStatus) =>
          Effect.gen(function* () {
            const draftId = `draft-${txStatus}`;
            yield* createTestDraft({
              id: draftId,
              userId,
              title: "Before",
              txStatus,
            });

            const response = yield* updateDraftRequest(client, draftId, {
              title: "After",
            });

            const [stored] = yield* db
              .select({ title: draft.title })
              .from(draft)
              .where(eq(draft.id, draftId));

            return {
              txStatus,
              status: response.status,
              title: stored?.title,
            };
          }),
      );

      // A failed publish leaves the draft editable again.
      expect(results).toStrictEqual([
        { txStatus: "PENDING", status: 409, title: "Before" },
        { txStatus: "PROCESSING", status: 409, title: "Before" },
        { txStatus: "FAILED", status: 200, title: "After" },
      ]);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("draft routes expose the publish status", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      const statuses = [null, "PENDING", "PROCESSING", "FAILED"] as const;

      yield* Effect.forEach(statuses, (txStatus, index) =>
        createTestDraft({
          id: `draft-${index}`,
          userId,
          txStatus,
          updatedAt: new Date(Date.UTC(2026, 0, 1, 0, 0, index)),
        }),
      );

      const list = yield* HttpClientResponse.schemaBodyJson(DraftListResponse)(
        yield* client.get("/api/drafts"),
      );

      const single = yield* Effect.forEach(statuses, (_, index) =>
        Effect.gen(function* () {
          const response = yield* client.get(`/api/drafts/draft-${index}`);

          return (yield* HttpClientResponse.schemaBodyJson(Draft)(response))
            .publishStatus;
        }),
      );

      expect({
        // The list is newest first.
        list: list.results.map((item) => item.publishStatus),
        single,
      }).toStrictEqual({
        list: ["FAILED", "PROCESSING", "PENDING", null],
        single: [null, "PENDING", "PROCESSING", "FAILED"],
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("DELETE /api/drafts/:draftId deletes a draft", () => {
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
    "DELETE /api/drafts/:draftId rejects deletion while publishing",
    () =>
      Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        const db = yield* Database;

        const results = yield* Effect.forEach(
          ["PENDING", "PROCESSING", "FAILED"] as const,
          (txStatus) =>
            Effect.gen(function* () {
              const draftId = `draft-${txStatus}`;
              yield* createTestDraft({ id: draftId, userId, txStatus });

              const response = yield* deleteDraftRequest(client, draftId);

              const [stored] = yield* db
                .select({ id: draft.id })
                .from(draft)
                .where(eq(draft.id, draftId));

              return {
                txStatus,
                status: response.status,
                kept: stored !== undefined,
              };
            }),
        );

        // A failed publish leaves the draft deletable again.
        expect(results).toStrictEqual([
          { txStatus: "PENDING", status: 409, kept: true },
          { txStatus: "PROCESSING", status: 409, kept: true },
          { txStatus: "FAILED", status: 204, kept: false },
        ]);
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("DELETE /api/drafts/:draftId returns 404 when not found", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* deleteDraftRequest(client, "non-existent");

      expect(response.status).toBe(404);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "POST /api/drafts/:draftId/publish validates draft existence, metadata, signature, wallet ownership, and replay",
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

        const duplicateSigBody =
          yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(
            duplicateSigRes,
          );

        expect({
          status: duplicateSigRes.status,
          message: duplicateSigBody.message,
        }).toStrictEqual({
          status: 409,
          message: "Metadata signature has already been published",
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.live(
    "POST & GET /api/drafts/:draftId/publish enqueues and completes publishing",
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

        // Publishing schedules OpenTimestamps stamping and upgrading.
        const postOtsRow = yield* waitForPostOtsStatus(
          ARWEAVE_TEST_UPLOAD_ID,
          "UPGRADED",
        );

        expect({
          unstartedStatus: unstartedRes.status,
          publishStatus: publishRes.status,
          publishBody,
          currentStatus,
          deletedDraft,
          createdPostId: createdPost.id,
          createdPostArweaveId: createdPost.arweaveTxId,
          otsStatus: postOtsRow.status,
          otsTxId: postOtsRow.otsTxId,
        }).toStrictEqual({
          unstartedStatus: 404,
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
          otsStatus: "UPGRADED",
          otsTxId: "arweave-test-upload-id",
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
    "GET /api/drafts/:draftId/publish reports FAILED when upload fails and allows retry via POST",
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
    "POST /api/drafts/:draftId/publish recovers a draft with a stale in-flight status",
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

  it.live(
    "POST /api/drafts/:draftId/publish reuses the Arweave checkpoint when the signed metadata is unchanged",
    () =>
      Effect.gen(function* () {
        const uploads: Array<ArweaveUploadOptions> = [];

        const layer = makeTestServerLayer({}, [], {
          arweave: ArweaveService.layerTest(uploads),
        });

        yield* Effect.gen(function* () {
          const { client, userId } = yield* createAuthenticatedClient();
          const db = yield* Database;
          const ownerWallet = createTestSiwsCredentials("testnet");

          yield* createTestWalletAddress({
            userId,
            address: ownerWallet.address,
          });

          const signedMetadata = createSignedTestPostMetadata({
            draftId: "draft-checkpoint",
            privateKey: ownerWallet.privateKey,
          });

          // A previous attempt uploaded the metadata, then failed before
          // finalizing; its checkpoint is bound to this exact signature.
          yield* createTestDraft({
            id: "draft-checkpoint",
            userId,
            txStatus: "FAILED",
            arweaveTxId: "checkpoint-arweave-tx",
            publishSignature: signedMetadata.signature,
          });

          const publishRes = yield* publishDraftRequest(
            client,
            "draft-checkpoint",
            { metadata: signedMetadata },
          );

          expect(publishRes.status).toBe(202);

          const status = yield* waitForPublishStatus(
            client,
            "draft-checkpoint",
            (current) => current.status === "COMPLETED",
          );

          const [createdPost] = yield* db
            .select()
            .from(post)
            .where(eq(post.draftId, "draft-checkpoint"));

          const metadataUploads = uploads.filter(
            (upload) => upload.contentType === "application/json",
          );

          expect({
            uploads: metadataUploads.length,
            status: status.status,
            arweaveId: createdPost.arweaveTxId,
          }).toStrictEqual({
            uploads: 0,
            status: "COMPLETED",
            arweaveId: "checkpoint-arweave-tx",
          });
        }).pipe(Effect.provide(layer));
      }),
  );

  it.live(
    "POST /api/drafts/:draftId/publish clears the Arweave checkpoint when the signed metadata changes",
    () =>
      Effect.gen(function* () {
        const uploads: Array<ArweaveUploadOptions> = [];

        const layer = makeTestServerLayer({}, [], {
          arweave: ArweaveService.layerTest(uploads),
        });

        yield* Effect.gen(function* () {
          const { client, userId } = yield* createAuthenticatedClient();
          const db = yield* Database;
          const ownerWallet = createTestSiwsCredentials("testnet");

          yield* createTestWalletAddress({
            userId,
            address: ownerWallet.address,
          });

          yield* createTestDraft({
            id: "draft-recheckpoint",
            userId,
            txStatus: "FAILED",
            arweaveTxId: "old-arweave-tx",
            publishSignature: "old-signature",
          });

          const publishRes = yield* publishDraftRequest(
            client,
            "draft-recheckpoint",
            {
              metadata: createSignedTestPostMetadata({
                draftId: "draft-recheckpoint",
                privateKey: ownerWallet.privateKey,
              }),
            },
          );

          expect(publishRes.status).toBe(202);

          const status = yield* waitForPublishStatus(
            client,
            "draft-recheckpoint",
            (current) => current.status === "COMPLETED",
          );

          const [createdPost] = yield* db
            .select()
            .from(post)
            .where(eq(post.draftId, "draft-recheckpoint"));

          const metadataUploads = uploads.filter(
            (upload) => upload.contentType === "application/json",
          );

          expect({
            uploads: metadataUploads.length,
            status: status.status,
            arweaveId: createdPost.arweaveTxId,
          }).toStrictEqual({
            uploads: 1,
            status: "COMPLETED",
            arweaveId: ARWEAVE_TEST_UPLOAD_ID,
          });
        }).pipe(Effect.provide(layer));
      }),
  );

  it.effect(
    "GET /api/protected/drafts/:draftId/publish returns 404 before publishing",
    () =>
      Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        yield* createTestDraft({ id: "draft-1", userId });

        const responses = yield* Effect.forEach(
          ["draft-1", "missing"],
          (draftId) =>
            Effect.gen(function* () {
              const response = yield* getPublishStatusRequest(client, draftId);

              const body =
                yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(
                  response,
                );

              return { status: response.status, message: body.message };
            }),
        );

        expect(responses).toStrictEqual([
          { status: 404, message: "Draft publishing has not been started" },
          { status: 404, message: "Draft not found" },
        ]);
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("draft routes return 401 without a session", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const responses = yield* Effect.all([
        createDraftRequest(client),
        client.get("/api/drafts"),
        client.get("/api/drafts/draft-1"),
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

describe("draft payload limits", () => {
  const tags = (count: number, length = 3) =>
    Array.from({ length: count }, (_, index) => `${index}`.padEnd(length, "x"));

  // Each value at its limit is accepted, one past it is rejected.
  const cases = [
    {
      field: "title",
      valid: "x".repeat(DRAFT_LIMITS.title),
      invalid: "x".repeat(DRAFT_LIMITS.title + 1),
    },
    {
      field: "metaTitle",
      valid: "x".repeat(DRAFT_LIMITS.metaTitle),
      invalid: "x".repeat(DRAFT_LIMITS.metaTitle + 1),
    },
    {
      field: "metaDescription",
      valid: "x".repeat(DRAFT_LIMITS.metaDescription),
      invalid: "x".repeat(DRAFT_LIMITS.metaDescription + 1),
    },
    {
      field: "tags",
      valid: tags(DRAFT_LIMITS.tags),
      invalid: tags(DRAFT_LIMITS.tags + 1),
    },
    {
      field: "tags",
      valid: tags(1, DRAFT_LIMITS.tag),
      invalid: tags(1, DRAFT_LIMITS.tag + 1),
    },
    { field: "tags", valid: [], invalid: [""] },
    { field: "tags", valid: [], invalid: null },
    {
      field: "coverImage",
      valid: "https://cdn.test/cover.webp",
      invalid: "cover.png",
    },
    {
      field: "coverImage",
      valid: "http://example.com/a.png",
      invalid: "data:image/png;base64,AAAA",
    },
    {
      field: "canonicalUri",
      valid: "https://example.com/post",
      invalid: "ftp://example.com/post",
    },
    {
      field: "canonicalUri",
      valid: `https://example.com/${"x".repeat(DRAFT_LIMITS.canonicalUri - 20)}`,
      invalid: `https://example.com/${"x".repeat(DRAFT_LIMITS.canonicalUri - 19)}`,
    },
  ];

  it.each([
    ["create", CreateDraftPayload],
    ["update", UpdateDraftPayload],
  ] as const)("%s payload enforces the field limits", (_name, schema) => {
    const decode = Schema.decodeUnknownExit(schema);

    expect(
      cases.map(({ field, valid, invalid }) => ({
        field,
        valid: Exit.isSuccess(decode({ [field]: valid })),
        invalid: Exit.isSuccess(decode({ [field]: invalid })),
      })),
    ).toStrictEqual(
      cases.map(({ field }) => ({ field, valid: true, invalid: false })),
    );
  });
});

// On testnet, wallets in PRO_ADDRESSES are on the pro plan.
const PRO_WALLET_ADDRESS = createTestSiwsCredentials().address;

const draftImageServerLayer = (
  recorder: StorageTestRecorder,
  posthogEvents: Array<PostHogEvent> = [],
) =>
  makeTestServerLayer({ PRO_ADDRESSES: [PRO_WALLET_ADDRESS] }, posthogEvents, {
    storage: StorageService.layerTest(recorder),
  });

const createProClient = () =>
  createAuthenticatedClient({ address: PRO_WALLET_ADDRESS });

const makePngBuffer = (width: number, height: number) =>
  Effect.promise(() =>
    sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 128, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer(),
  );

const uploadDraftImageRequest = (
  client: HttpClient.HttpClient,
  draftId: string,
  bytes: Uint8Array<ArrayBuffer>,
) =>
  client.execute(
    HttpClientRequest.post(`/api/drafts/${draftId}/images`).pipe(
      HttpClientRequest.bodyUint8Array(bytes, "image/png"),
    ),
  );

describe("draft images", () => {
  it.effect("POST /:draftId/images stores a resized webp for pro users", () => {
    const recorder = makeStorageTestRecorder();
    const events: Array<PostHogEvent> = [];

    return Effect.gen(function* () {
      const { client, userId } = yield* createProClient();
      const created = yield* createTestDraft({ userId });
      const png = yield* makePngBuffer(2000, 1000);

      const response = yield* uploadDraftImageRequest(
        client,
        created.id,
        new Uint8Array(png),
      );

      const body = yield* HttpClientResponse.schemaBodyJson(
        UploadDraftImageResponse,
      )(response);

      const uploaded = recorder.uploads[0];
      const uploadedBytes = Buffer.from(uploaded?.body ?? new Uint8Array());
      const version = sha256Hex(uploadedBytes);
      const key = `u/${userId}/drafts/${created.id}/${version}.webp`;
      const url = `${STORAGE_TEST_PUBLIC_URL}/${key}`;

      const metadata = yield* Effect.promise(() =>
        sharp(uploadedBytes).metadata(),
      );

      const db = yield* Database;

      const [savedMedia] = yield* db
        .select()
        .from(mediaImage)
        .where(eq(mediaImage.id, url))
        .limit(1)
        .pipe(Effect.orDie);

      expect({
        status: response.status,
        body,
        upload: uploaded && {
          contentType: uploaded.contentType,
          key: uploaded.key,
          version: uploaded.version,
        },
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        media: savedMedia && {
          status: savedMedia.status,
          mimeType: savedMedia.mimeType,
          width: savedMedia.width,
          height: savedMedia.height,
          size: savedMedia.size,
          thumbhash: savedMedia.thumbhash,
        },
        events,
      }).toStrictEqual({
        status: 201,
        body: {
          url,
          key,
          width: 1000,
          height: 500,
          thumbhash: expect.any(String),
        },
        upload: { contentType: "image/webp", key, version },
        format: "webp",
        width: 1000,
        height: 500,
        media: {
          status: "READY",
          mimeType: "image/webp",
          width: 1000,
          height: 500,
          size: uploadedBytes.length,
          thumbhash: body.thumbhash,
        },
        events: [
          {
            distinctId: userId,
            event: "draft media uploaded",
            properties: {
              draftId: created.id,
              key,
              sizeBytes: uploadedBytes.length,
              url,
            },
          },
        ],
      });
    }).pipe(Effect.provide(draftImageServerLayer(recorder, events)));
  });

  it.effect("POST /:draftId/images returns 403 for free users", () => {
    const recorder = makeStorageTestRecorder();

    return Effect.gen(function* () {
      // A random wallet outside PRO_ADDRESSES, so the user is on the free plan.
      const { client, userId } = yield* createAuthenticatedClient();

      const created = yield* createTestDraft({ userId });
      const png = yield* makePngBuffer(16, 16);

      const response = yield* uploadDraftImageRequest(
        client,
        created.id,
        new Uint8Array(png),
      );

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect({
        status: response.status,
        message: body.message,
        uploads: recorder.uploads.length,
      }).toStrictEqual({
        status: 403,
        message:
          "Image uploads are available on the Pro plan. Embed an image from a URL instead.",
        uploads: 0,
      });
    }).pipe(Effect.provide(draftImageServerLayer(recorder)));
  });

  it.effect(
    "POST /:draftId/images returns 404 for another user's draft",
    () => {
      const recorder = makeStorageTestRecorder();

      return Effect.gen(function* () {
        const { client } = yield* createProClient();
        const other = yield* createAuthenticatedClient();
        const otherDraft = yield* createTestDraft({ userId: other.userId });
        const png = yield* makePngBuffer(16, 16);

        const responses = yield* Effect.all([
          uploadDraftImageRequest(client, otherDraft.id, new Uint8Array(png)),
          uploadDraftImageRequest(client, "missing", new Uint8Array(png)),
        ]);

        expect({
          statuses: responses.map((response) => response.status),
          uploads: recorder.uploads.length,
        }).toStrictEqual({ statuses: [404, 404], uploads: 0 });
      }).pipe(Effect.provide(draftImageServerLayer(recorder)));
    },
  );

  it.effect("POST /:draftId/images accepts at most 5 MiB", () => {
    const recorder = makeStorageTestRecorder();

    return Effect.gen(function* () {
      const { client, userId } = yield* createProClient();
      const created = yield* createTestDraft({ userId });

      const response = yield* uploadDraftImageRequest(
        client,
        created.id,
        new Uint8Array(5 * 1024 * 1024 + 1),
      );

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect({
        status: response.status,
        message: body.message,
        uploads: recorder.uploads.length,
      }).toStrictEqual({
        status: 413,
        message: "Image is too large, maximum size is 5 MiB.",
        uploads: 0,
      });
    }).pipe(Effect.provide(draftImageServerLayer(recorder)));
  });

  it.effect(
    "POST /:draftId/images stores nothing when the placeholder fails",
    () => {
      const recorder = makeStorageTestRecorder();

      // Real optimization, failing ThumbHash generation.
      const imageProcessing = Layer.succeed(ImageProcessingService, {
        optimize: optimizeImage,
        generateThumbhash: () =>
          Effect.fail(
            new ImageOptimizationError({
              cause: new Error("thumbhash failed"),
              message: "thumbhash failed",
            }),
          ),
      });

      return Effect.gen(function* () {
        const { client, userId } = yield* createProClient();
        const created = yield* createTestDraft({ userId });
        const png = yield* makePngBuffer(16, 16);

        const response = yield* uploadDraftImageRequest(
          client,
          created.id,
          new Uint8Array(png),
        );

        const body =
          yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

        const db = yield* Database;
        const mediaRows = yield* db.select().from(mediaImage);

        expect({
          status: response.status,
          message: body.message,
          uploads: recorder.uploads.length,
          mediaRows: mediaRows.length,
        }).toStrictEqual({
          status: 500,
          message: "Failed to generate image placeholder.",
          uploads: 0,
          mediaRows: 0,
        });
      }).pipe(
        Effect.provide(
          makeTestServerLayer({ PRO_ADDRESSES: [PRO_WALLET_ADDRESS] }, [], {
            storage: StorageService.layerTest(recorder),
            imageProcessing,
          }),
        ),
      );
    },
  );

  it.effect(
    "POST /:draftId/images rejects a body over 5 MiB sent without Content-Length",
    () => {
      const recorder = makeStorageTestRecorder();

      return Effect.gen(function* () {
        const { client, userId } = yield* createProClient();
        const created = yield* createTestDraft({ userId });

        // A streamed body is sent chunked, so only the body read limit can
        // reject it.
        const response = yield* client.execute(
          HttpClientRequest.post(`/api/drafts/${created.id}/images`).pipe(
            HttpClientRequest.bodyStream(
              Stream.make(
                new Uint8Array(3 * 1024 * 1024),
                new Uint8Array(3 * 1024 * 1024),
              ),
              { contentType: "image/png" },
            ),
          ),
        );

        const body =
          yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

        expect({
          status: response.status,
          message: body.message,
          uploads: recorder.uploads.length,
        }).toStrictEqual({
          status: 413,
          message: "Image is too large, maximum size is 5 MiB.",
          uploads: 0,
        });
      }).pipe(Effect.provide(draftImageServerLayer(recorder)));
    },
  );
});
