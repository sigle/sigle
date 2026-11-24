import { describe, expect, it } from "@effect/vitest";
import { eq, inArray } from "drizzle-orm";
import {
  Deferred,
  Effect,
  ErrorReporter,
  Exit,
  Layer,
  Option,
  Schema,
  Stream,
} from "effect";
import {
  Headers,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
import { TestClock } from "effect/testing";
import sharp from "sharp";
import type { PostHogEvent } from "@/services/posthog";
import {
  CreateDraftPayload,
  Draft,
  DRAFT_CONTENT_TOTAL_MAX_MIB,
  DRAFT_COUNT_LIMIT,
  DRAFT_LIMITS,
  DraftListResponse,
  PublishDraftAccepted,
  PublishDraftStatusResponse,
  UpdateDraftPayload,
} from "@/api/groups/drafts";
import { UploadedImageResponse } from "@/api/schemas";
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
  createTestUser,
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

  it.effect("POST /api/drafts allows 100 drafts per user", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      const other = yield* createAuthenticatedClient();

      yield* Effect.forEach(Array.from({ length: DRAFT_COUNT_LIMIT - 1 }), () =>
        createTestDraft({ userId }),
      );

      const last = yield* createDraftRequest(client);
      const overLimit = yield* createDraftRequest(client);
      const otherUser = yield* createDraftRequest(other.client);

      expect({
        last: last.status,
        overLimit: overLimit.status,
        body: yield* overLimit.json,
        otherUser: otherUser.status,
      }).toStrictEqual({
        last: 201,
        overLimit: 403,
        body: {
          message:
            "You can have up to 100 drafts. Delete a draft to create a new one.",
        },
        otherUser: 201,
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("drafts hold up to 10 MiB of content per user", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      const db = yield* Database;
      const maxBytes = DRAFT_CONTENT_TOTAL_MAX_MIB * 1024 * 1024;

      // 2-byte characters, so the limit counts bytes, not characters.
      yield* createTestDraft({
        id: "big",
        userId,
        content: "é".repeat(maxBytes / 2 - 50),
      });
      yield* createTestDraft({ id: "draft-1", userId, content: "" });

      const save = (content: string) =>
        updateDraftRequest(client, "draft-1", { content });

      const atLimit = yield* save("a".repeat(100));
      const overLimit = yield* save("a".repeat(101));

      const createWithContent = yield* createDraftRequest(client, {
        content: "a",
      });

      const createEmpty = yield* createDraftRequest(client, {});

      // A user over the limit can still shorten a draft.
      yield* db
        .update(draft)
        .set({ content: "é".repeat(maxBytes / 2) })
        .where(eq(draft.id, "big"));
      const shorten = yield* save("a".repeat(50));

      const [stored] = yield* db
        .select({ content: draft.content })
        .from(draft)
        .where(eq(draft.id, "draft-1"));

      expect({
        atLimit: atLimit.status,
        overLimit: overLimit.status,
        body: yield* overLimit.json,
        createWithContent: createWithContent.status,
        createEmpty: createEmpty.status,
        shorten: shorten.status,
        stored: stored?.content,
      }).toStrictEqual({
        atLimit: 200,
        overLimit: 403,
        body: {
          message:
            "Your drafts can hold up to 10 MiB of content in total. Delete or shorten a draft to save this one.",
        },
        createWithContent: 403,
        createEmpty: 201,
        shorten: 200,
        stored: "a".repeat(50),
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

  it.effect("PATCH /api/drafts/:draftId reads bodies up to 4 MiB", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      const db = yield* Database;
      const maxBytes = 4 * 1024 * 1024;

      yield* createTestDraft({ id: "draft-1", userId, content: "Before" });

      // `{"content":"..."}` around the content takes 14 bytes.
      const patch = (bytes: number) =>
        client.execute(
          HttpClientRequest.patch("/api/drafts/draft-1").pipe(
            HttpClientRequest.bodyText(
              JSON.stringify({ content: "a".repeat(bytes - 14) }),
              "application/json",
            ),
          ),
        );

      const overLimit = yield* patch(maxBytes + 1);

      const [stored] = yield* db
        .select({ content: draft.content })
        .from(draft)
        .where(eq(draft.id, "draft-1"));

      // A body at the limit is read, then rejected by the content limit.
      const atLimit = yield* patch(maxBytes);

      expect({
        overLimit: overLimit.status,
        stored: stored?.content,
        atLimit: atLimit.status,
      }).toStrictEqual({ overLimit: 413, stored: "Before", atLimit: 400 });
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

      // Reads the status as sent, the API schema would decode it to the
      // database value.
      const WireStatus = Schema.Struct({
        publishStatus: Schema.NullOr(Schema.String),
      });

      const list = yield* HttpClientResponse.schemaBodyJson(
        Schema.Struct({ results: Schema.Array(WireStatus) }),
      )(yield* client.get("/api/drafts"));

      const single = yield* Effect.forEach(statuses, (_, index) =>
        Effect.gen(function* () {
          const response = yield* client.get(`/api/drafts/draft-${index}`);

          return (yield* HttpClientResponse.schemaBodyJson(WireStatus)(
            response,
          )).publishStatus;
        }),
      );

      expect({
        // The list is newest first.
        list: list.results.map((item) => item.publishStatus),
        single,
      }).toStrictEqual({
        list: ["failed", "processing", "pending", null],
        single: [null, "pending", "processing", "failed"],
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

        // The four rejected publishes used the per-minute publish limit.
        yield* TestClock.adjust("1 minute");

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

        // The JSON holds the lowercase status the schema decodes to the
        // database value.
        const completedJson = yield* (yield* client.get(
          "/api/drafts/draft-pub-1/publish",
        )).json;

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
          publishLocation: Option.getOrUndefined(
            Headers.get(publishRes.headers, "location"),
          ),
          publishBody,
          currentStatus,
          completedJson,
          deletedDraft,
          createdPostId: createdPost.id,
          createdPostArweaveId: createdPost.arweaveTxId,
          otsStatus: postOtsRow.status,
          otsTxId: postOtsRow.otsTxId,
        }).toStrictEqual({
          unstartedStatus: 404,
          publishStatus: 202,
          publishLocation: "/api/drafts/draft-pub-1/publish",
          publishBody: {
            draftId: "draft-pub-1",
            status: "pending",
          },
          currentStatus: {
            status: "COMPLETED",
            postId: ARWEAVE_TEST_UPLOAD_ID,
            arweaveTxId: ARWEAVE_TEST_UPLOAD_ID,
          },
          completedJson: {
            status: "completed",
            postId: ARWEAVE_TEST_UPLOAD_ID,
            arweaveTxId: ARWEAVE_TEST_UPLOAD_ID,
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
            arweaveTxId: null,
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
            arweaveTxId: "recovered-arweave-tx",
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
        // which used to block re-publishing forever. It is older than the
        // claim lease, a fresh one is protected.
        yield* createTestDraft({
          id: "draft-stuck",
          userId,
          txStatus: "PENDING",
          arweaveTxId: "stale-arweave-tx",
          updatedAt: new Date(Date.now() - 3 * 60 * 1000),
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

  it.effect(
    "POST /api/drafts/:draftId/publish returns 409 while another signature is uploading",
    () =>
      Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        const db = yield* Database;
        const ownerWallet = createTestSiwsCredentials("testnet");

        yield* createTestWalletAddress({
          userId,
          address: ownerWallet.address,
        });

        // A worker is uploading the metadata of another signature.
        yield* createTestDraft({
          id: "draft-uploading",
          userId,
          txStatus: "PROCESSING",
          publishSignature: "other-signature",
          uploadClaimedAt: new Date(),
        });

        // Its worker crashed, the claim lease expired.
        yield* createTestDraft({
          id: "draft-abandoned",
          userId,
          txStatus: "PROCESSING",
          publishSignature: "other-signature",
          uploadClaimedAt: new Date(Date.now() - 3 * 60 * 1000),
        });

        const publish = (draftId: string) =>
          publishDraftRequest(client, draftId, {
            metadata: createSignedTestPostMetadata({
              draftId,
              privateKey: ownerWallet.privateKey,
            }),
          }).pipe(Effect.map((response) => response.status));

        const uploading = yield* publish("draft-uploading");
        const abandoned = yield* publish("draft-abandoned");

        const [uploadingDraft] = yield* db
          .select({ publishSignature: draft.publishSignature })
          .from(draft)
          .where(eq(draft.id, "draft-uploading"));

        expect({
          uploading,
          abandoned,
          signature: uploadingDraft?.publishSignature,
        }).toStrictEqual({
          uploading: 409,
          abandoned: 202,
          signature: "other-signature",
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "POST /api/drafts/:draftId/publish returns 409 once another signature has checkpointed its upload",
    () =>
      Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        const db = yield* Database;
        const ownerWallet = createTestSiwsCredentials("testnet");

        yield* createTestWalletAddress({
          userId,
          address: ownerWallet.address,
        });

        // A worker has uploaded the metadata of another signature and is
        // creating the post: the upload claim is released.
        yield* createTestDraft({
          id: "draft-checkpointed",
          userId,
          txStatus: "PROCESSING",
          publishSignature: "other-signature",
          arweaveTxId: "checkpointed-arweave-tx",
        });

        // A retry of that signature reset the status, its new job will
        // create the post from the checkpoint.
        yield* createTestDraft({
          id: "draft-checkpoint-retried",
          userId,
          txStatus: "PENDING",
          publishSignature: "other-signature",
          arweaveTxId: "retried-arweave-tx",
        });

        // Its worker crashed after the checkpoint, the lease expired.
        yield* createTestDraft({
          id: "draft-checkpoint-abandoned",
          userId,
          txStatus: "PROCESSING",
          publishSignature: "other-signature",
          arweaveTxId: "abandoned-arweave-tx",
          updatedAt: new Date(Date.now() - 3 * 60 * 1000),
        });

        const publish = (draftId: string) =>
          publishDraftRequest(client, draftId, {
            metadata: createSignedTestPostMetadata({
              draftId,
              privateKey: ownerWallet.privateKey,
            }),
          }).pipe(Effect.map((response) => response.status));

        const checkpointed = yield* publish("draft-checkpointed");
        const retried = yield* publish("draft-checkpoint-retried");
        const abandoned = yield* publish("draft-checkpoint-abandoned");

        const kept = yield* db
          .select({
            id: draft.id,
            publishSignature: draft.publishSignature,
            arweaveTxId: draft.arweaveTxId,
          })
          .from(draft)
          .where(
            inArray(draft.id, [
              "draft-checkpointed",
              "draft-checkpoint-retried",
            ]),
          )
          .orderBy(draft.id);

        expect({ checkpointed, retried, abandoned, kept }).toStrictEqual({
          checkpointed: 409,
          retried: 409,
          abandoned: 202,
          kept: [
            {
              id: "draft-checkpoint-retried",
              publishSignature: "other-signature",
              arweaveTxId: "retried-arweave-tx",
            },
            {
              id: "draft-checkpointed",
              publishSignature: "other-signature",
              arweaveTxId: "checkpointed-arweave-tx",
            },
          ],
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "POST /api/drafts/:draftId/publish enforces the daily publish limit of the free plan",
    () =>
      Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        const ownerWallet = createTestSiwsCredentials("testnet");

        const hoursAgo = (hours: number) =>
          new Date(Date.now() - hours * 60 * 60 * 1000);

        yield* createTestWalletAddress({
          userId,
          address: ownerWallet.address,
        });

        // Counted: two posts published from a draft in the last 24 hours, and
        // a publish in flight.
        yield* Effect.forEach([1, 2], (hours) =>
          createTestPost({
            userId,
            draftId: `published-${hours}`,
            createdAt: hoursAgo(hours),
          }),
        );

        const retrySigned = createSignedTestPostMetadata({
          draftId: "draft-retry",
          privateKey: ownerWallet.privateKey,
        });

        yield* createTestDraft({
          id: "draft-retry",
          userId,
          txStatus: "PENDING",
          publishSignature: retrySigned.signature,
        });

        // Not counted: an older post, a recent post indexed from Arweave, a
        // failed publish, and a publish stuck in flight for over a day.
        yield* createTestPost({
          userId,
          draftId: "published-old",
          createdAt: hoursAgo(25),
        });
        yield* createTestPost({ userId, draftId: null });
        yield* createTestDraft({ userId, txStatus: "FAILED" });
        yield* createTestDraft({
          userId,
          txStatus: "PENDING",
          updatedAt: hoursAgo(25),
        });

        yield* createTestDraft({ id: "draft-next", userId });

        const limited = yield* publishDraftRequest(client, "draft-next", {
          metadata: createSignedTestPostMetadata({
            draftId: "draft-next",
            privateKey: ownerWallet.privateKey,
          }),
        });

        const limitedBody = yield* limited.json;

        // Retrying the publish in flight replaces it, so it is not counted
        // against itself.
        const retry = yield* publishDraftRequest(client, "draft-retry", {
          metadata: retrySigned,
        });

        const limits = yield* client
          .get("/api/me/limits")
          .pipe(Effect.flatMap((response) => response.json));

        // The oldest counted post leaves the window in 22 hours.
        const resetInMillis = 22 * 60 * 60 * 1000;

        expect({
          limited: limited.status,
          limitedBody,
          retryAfter: Number(
            Option.getOrUndefined(Headers.get(limited.headers, "retry-after")),
          ),
          retry: retry.status,
          limits,
        }).toStrictEqual({
          limited: 429,
          limitedBody: {
            message:
              "You can publish 3 posts per day on the Free plan. Try again later, or upgrade to Pro to publish up to 20 posts per day.",
            retryAfterMillis: expect.toSatisfy(
              (millis: number) =>
                millis <= resetInMillis && millis > resetInMillis - 60_000,
            ),
          },
          retryAfter: expect.toSatisfy(
            (seconds: number) =>
              seconds <= resetInMillis / 1000 &&
              seconds > resetInMillis / 1000 - 60,
          ),
          retry: 202,
          limits: {
            publish: {
              limit: 3,
              used: 3,
              resetsAt: expect.toSatisfy(
                (resetsAt: string) =>
                  Math.abs(
                    new Date(resetsAt).getTime() - (Date.now() + resetInMillis),
                  ) < 60_000,
              ),
            },
            profileUpdate: { limit: 10, used: 0, resetsAt: null },
          },
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "POST /api/drafts/:draftId/publish allows the daily publish limit of the pro plan",
    () => {
      const ownerWallet = createTestSiwsCredentials("testnet");

      return Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient({
          plan: "pro",
        });

        yield* createTestWalletAddress({
          userId,
          address: ownerWallet.address,
        });

        // Over the free limit.
        yield* Effect.forEach([1, 2, 3], (index) =>
          createTestPost({ userId, draftId: `published-${index}` }),
        );

        yield* createTestDraft({ id: "draft-pro", userId });

        const publish = yield* publishDraftRequest(client, "draft-pro", {
          metadata: createSignedTestPostMetadata({
            draftId: "draft-pro",
            privateKey: ownerWallet.privateKey,
          }),
        });

        const limits = yield* client
          .get("/api/me/limits")
          .pipe(Effect.flatMap((response) => response.json));

        expect({ publish: publish.status, limits }).toStrictEqual({
          publish: 202,
          limits: {
            publish: expect.objectContaining({ limit: 20 }),
            profileUpdate: expect.objectContaining({ limit: 10 }),
          },
        });
      }).pipe(Effect.provide(makeTestServerLayer()));
    },
  );

  it.effect(
    "POST /api/drafts/:draftId/publish enforces a separate global daily publish limit per plan and reports it",
    () => {
      const reports: Array<{
        readonly message: string;
        readonly attributes: object;
      }> = [];

      // The 429 responses are reported too, keep the limit reports.
      const reporter = ErrorReporter.make(({ error, attributes }) => {
        if (error.name === "GlobalPublishLimitReached") {
          reports.push({ message: error.message, attributes });
        }
      });

      const freeWallet = createTestSiwsCredentials("testnet");
      const proWallet = createTestSiwsCredentials("testnet");

      return Effect.gen(function* () {
        // Free publishes of other users fill the Free global limit: a post and
        // a publish in flight. A Pro post counts against the Pro limit only.
        const otherFree = yield* createTestUser();
        const otherPro = yield* createTestUser({ plan: "pro" });

        yield* createTestPost({ userId: otherFree.id, draftId: "free-post" });
        yield* createTestDraft({ userId: otherFree.id, txStatus: "PENDING" });
        yield* createTestPost({ userId: otherPro.id, draftId: "pro-post" });

        const free = yield* createAuthenticatedClient({
          address: freeWallet.address,
        });

        const pro = yield* createAuthenticatedClient({
          plan: "pro",
          address: proWallet.address,
        });

        yield* createTestDraft({ id: "draft-free", userId: free.userId });
        yield* createTestDraft({ id: "draft-pro", userId: pro.userId });

        const publishFree = publishDraftRequest(free.client, "draft-free", {
          metadata: createSignedTestPostMetadata({
            draftId: "draft-free",
            privateKey: freeWallet.privateKey,
          }),
        });

        const limited = yield* publishFree;
        const limitedBody = yield* limited.json;
        // Reported once while the limit stays reached.
        const limitedAgain = yield* publishFree;

        const proPublish = yield* publishDraftRequest(pro.client, "draft-pro", {
          metadata: createSignedTestPostMetadata({
            draftId: "draft-pro",
            privateKey: proWallet.privateKey,
          }),
        });

        expect({
          limited: limited.status,
          limitedBody,
          limitedAgain: limitedAgain.status,
          pro: proPublish.status,
          reports,
        }).toStrictEqual({
          limited: 429,
          limitedBody: {
            message:
              "Sigle reached today's publishing limit for Free accounts. Try again later, or upgrade to Pro to keep publishing.",
            retryAfterMillis: expect.any(Number),
          },
          limitedAgain: 429,
          pro: 202,
          reports: [
            {
              message:
                "The free plan reached its global limit of 2 publishes per 24 hours, publishes are rejected",
              attributes: { plan: "free", limit: 2 },
            },
          ],
        });
      }).pipe(
        Effect.provide(
          makeTestServerLayer({
            PUBLISH_GLOBAL_DAILY_LIMIT_FREE: 2,
            PUBLISH_GLOBAL_DAILY_LIMIT_PRO: 2,
          }).pipe(Layer.provide(ErrorReporter.layer([reporter]))),
        ),
      );
    },
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
      field: "coverImage",
      valid: "ar://bNbA3TEQVL60xlgCcqdz4ZPHFZ711cZ3hmkpGttDt_U",
      invalid: "ftp://example.com/cover.png",
    },
    {
      field: "coverImage",
      valid:
        "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      invalid: "file:///etc/passwd",
    },
    // Canonical URIs point to a web page, Arweave and IPFS URLs are rejected.
    {
      field: "canonicalUri",
      valid: "http://example.com/post",
      invalid: "ar://bNbA3TEQVL60xlgCcqdz4ZPHFZ711cZ3hmkpGttDt_U",
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

const draftImageServerLayer = (
  recorder: StorageTestRecorder,
  posthogEvents: Array<PostHogEvent> = [],
) =>
  makeTestServerLayer({}, posthogEvents, {
    storage: StorageService.layerTest(recorder),
  });

const createProClient = () => createAuthenticatedClient({ plan: "pro" });

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
        UploadedImageResponse,
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
          sizeBytes: uploadedBytes.length,
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
      // New users are on the free plan.
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
          makeTestServerLayer({}, [], {
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
