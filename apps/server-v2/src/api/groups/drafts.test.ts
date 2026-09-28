import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Effect, Schema } from "effect";
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/unstable/http";
import type { PostHogEvent } from "@/services/posthog";
import { DraftListItem, Draft, UpdateDraftResponse } from "@/api/groups/drafts";
import { Database } from "@/db";
import { draft } from "@/db/schema";
import { createAuthenticatedClient, createTestDraft } from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const CreateDraftResponse = Schema.Struct({ id: Schema.String });

const ErrorResponse = Schema.Struct({ message: Schema.String });

const listDrafts = (client: HttpClient.HttpClient, limit: number) =>
  client
    .get(`/api/protected/drafts/list?limit=${limit}`)
    .pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(Schema.Array(DraftListItem)),
      ),
    );

describe("drafts", () => {
  it.effect("POST /api/protected/drafts/create creates a new draft", () => {
    const events: Array<PostHogEvent> = [];

    return Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      const db = yield* Database;

      const response = yield* client.execute(
        HttpClientRequest.post("/api/protected/drafts/create"),
      );

      const body =
        yield* HttpClientResponse.schemaBodyJson(CreateDraftResponse)(response);

      const [created] = yield* db
        .select()
        .from(draft)
        .where(eq(draft.id, body.id));

      expect(response.status).toBe(200);
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

  it.effect("GET /api/protected/drafts/list returns list of drafts", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      yield* createTestDraft({ id: "draft-1", userId, title: "Draft 1" });
      yield* createTestDraft({ id: "draft-2", userId, title: "Draft 2" });

      const drafts = yield* listDrafts(client, 10);

      expect(drafts).toHaveLength(2);
      expect(drafts.map((item) => item.id).sort()).toStrictEqual([
        "draft-1",
        "draft-2",
      ]);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "GET /api/protected/drafts/list returns empty list when no drafts",
    () =>
      Effect.gen(function* () {
        const { client } = yield* createAuthenticatedClient();

        const drafts = yield* listDrafts(client, 10);

        expect(drafts).toStrictEqual([]);
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/protected/drafts/list respects limit parameter", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      yield* createTestDraft({ id: "draft-1", userId, title: "Draft 1" });
      yield* createTestDraft({ id: "draft-2", userId, title: "Draft 2" });
      yield* createTestDraft({ id: "draft-3", userId, title: "Draft 3" });

      const drafts = yield* listDrafts(client, 2);

      expect(drafts).toHaveLength(2);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "GET /api/protected/drafts/list returns 403 when user is not whitelisted",
    () =>
      Effect.gen(function* () {
        const { client } = yield* createAuthenticatedClient();

        const response = yield* client.get(
          "/api/protected/drafts/list?limit=10",
        );

        const body =
          yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

        expect(response.status).toBe(403);
        expect(body.message).toBe("User is not whitelisted");
      }).pipe(Effect.provide(makeTestServerLayer({ STACKS_ENV: "mainnet" }))),
  );

  it.effect("GET /api/protected/drafts/:draftId returns draft by id", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      const created = yield* createTestDraft({
        id: "draft-1",
        userId,
        title: "Test Draft",
      });

      const response = yield* client.get("/api/protected/drafts/draft-1");

      const body = yield* HttpClientResponse.schemaBodyJson(Draft)(response);

      expect(response.status).toBe(200);
      expect(body).toMatchObject({
        id: created.id,
        title: "Test Draft",
        content: "Test content",
        type: "draft",
        tags: null,
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "GET /api/protected/drafts returns 404 when draftId is missing",
    () =>
      Effect.gen(function* () {
        const { client } = yield* createAuthenticatedClient();

        const response = yield* client.get("/api/protected/drafts/");

        expect(response.status).toBe(404);
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "GET /api/protected/drafts/:draftId returns 404 when draft not found",
    () =>
      Effect.gen(function* () {
        const { client } = yield* createAuthenticatedClient();

        const response = yield* client.get(
          "/api/protected/drafts/non-existent",
        );

        const body =
          yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

        expect(response.status).toBe(404);
        expect(body.message).toBe("Not Found");
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("POST /api/protected/drafts/:draftId/update updates a draft", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();
      const db = yield* Database;

      yield* createTestDraft({
        id: "draft-1",
        userId,
        title: "Old Title",
      });

      const response = yield* client.execute(
        HttpClientRequest.post("/api/protected/drafts/draft-1/update").pipe(
          HttpClientRequest.bodyJsonUnsafe({
            title: "New Title",
            content: "New Content",
          }),
        ),
      );

      const body =
        yield* HttpClientResponse.schemaBodyJson(UpdateDraftResponse)(response);

      expect(response.status).toBe(200);
      expect(body).toStrictEqual({ id: "draft-1" });

      const [updatedDraft] = yield* db
        .select()
        .from(draft)
        .where(eq(draft.id, "draft-1"));

      expect(updatedDraft).toMatchObject({
        title: "New Title",
        content: "New Content",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "POST /api/protected/drafts/:draftId/update returns 404 when draft not found",
    () =>
      Effect.gen(function* () {
        const { client } = yield* createAuthenticatedClient();

        const response = yield* client.execute(
          HttpClientRequest.post(
            "/api/protected/drafts/non-existent/update",
          ).pipe(
            HttpClientRequest.bodyJsonUnsafe({
              title: "New Title",
              content: "New Content",
            }),
          ),
        );

        const body =
          yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

        expect(response.status).toBe(404);
        expect(body.message).toBe("Not Found");
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "POST /api/protected/drafts/:draftId/delete returns 404 when draft not found",
    () =>
      Effect.gen(function* () {
        const { client } = yield* createAuthenticatedClient();

        const response = yield* client.execute(
          HttpClientRequest.post("/api/protected/drafts/non-existent/delete"),
        );

        const body =
          yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

        expect(response.status).toBe(404);
        expect(body.message).toBe("Not Found");
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "POST /api/protected/drafts/:draftId/delete deletes a draft",
    () => {
      const events: Array<PostHogEvent> = [];

      return Effect.gen(function* () {
        const { client, userId } = yield* createAuthenticatedClient();
        const db = yield* Database;

        yield* createTestDraft({
          id: "draft-1",
          userId,
          title: "To Delete",
        });

        const response = yield* client.execute(
          HttpClientRequest.post("/api/protected/drafts/draft-1/delete"),
        );

        const body = yield* HttpClientResponse.schemaBodyJson(Schema.Boolean)(
          response,
        );

        expect(response.status).toBe(200);
        expect(body).toBe(true);

        const [deletedDraft] = yield* db
          .select()
          .from(draft)
          .where(eq(draft.id, "draft-1"));

        expect(deletedDraft).toBeUndefined();
        expect(events).toStrictEqual([
          {
            distinctId: userId,
            event: "draft deleted",
            properties: { draftId: "draft-1" },
          },
        ]);
      }).pipe(Effect.provide(makeTestServerLayer({}, events)));
    },
  );
});
