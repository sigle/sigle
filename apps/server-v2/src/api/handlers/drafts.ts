import { createId } from "@paralleldrive/cuid2";
import { and, count, desc, eq } from "drizzle-orm";
import { DateTime, Effect } from "effect";
import { HttpApiBuilder, HttpApiSchema } from "effect/unstable/httpapi";
import { SigleApi } from "@/api";
import {
  CreateDraftPayload,
  DRAFT_LIST_DEFAULT_LIMIT,
  DraftListQuery,
  UpdateDraftPayload,
} from "@/api/groups/drafts";
import { CurrentUser } from "@/api/middleware/auth-user";
import { NotFound } from "@/api/schemas";
import { Database } from "@/db";
import { draft } from "@/db/schema";
import { PostHogService } from "@/services/posthog";

const toDraft = (row: typeof draft.$inferSelect) => ({
  id: row.id,
  title: row.title,
  content: row.content,
  metaTitle: row.metaTitle,
  metaDescription: row.metaDescription,
  coverImage: row.coverImage,
  tags: row.tags ?? [],
  canonicalUri: row.canonicalUri,
  createdAt: DateTime.fromDateUnsafe(row.createdAt),
  updatedAt: DateTime.fromDateUnsafe(row.updatedAt),
});

export const createDraft = (payload: typeof CreateDraftPayload.Type) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;
    const posthog = yield* PostHogService;

    const [inserted] = yield* db
      .insert(draft)
      .values({
        // Move to native @default cuid2 once drizzle supports it.
        id: createId(),
        title: payload.title ?? "",
        content: payload.content ?? "",
        metaTitle: payload.metaTitle ?? null,
        metaDescription: payload.metaDescription ?? null,
        coverImage: payload.coverImage ?? null,
        tags: payload.tags === undefined ? [] : [...payload.tags],
        canonicalUri: payload.canonicalUri ?? null,
        userId: user.id,
      })
      .returning()
      .pipe(Effect.orDie);

    yield* posthog.capture({
      distinctId: user.id,
      event: "draft created",
      properties: {
        postId: inserted.id,
      },
    });

    return HttpApiSchema.withHeaders({
      body: toDraft(inserted),
      headers: {
        location: `/api/protected/drafts/${inserted.id}`,
      },
    });
  });

export const listDrafts = (query: typeof DraftListQuery.Type) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;
    const limit = query.limit ?? DRAFT_LIST_DEFAULT_LIMIT;
    const offset = query.offset ?? 0;

    const [totals] = yield* db
      .select({ count: count() })
      .from(draft)
      .where(eq(draft.userId, user.id))
      .pipe(Effect.orDie);

    const drafts = yield* db
      .select({
        id: draft.id,
        title: draft.title,
        metaTitle: draft.metaTitle,
        metaDescription: draft.metaDescription,
        coverImage: draft.coverImage,
        tags: draft.tags,
        canonicalUri: draft.canonicalUri,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      })
      .from(draft)
      .where(eq(draft.userId, user.id))
      .orderBy(desc(draft.updatedAt), desc(draft.id))
      .limit(limit)
      .offset(offset)
      .pipe(Effect.orDie);

    return {
      results: drafts.map((item) => ({
        ...item,
        tags: item.tags ?? [],
        createdAt: DateTime.fromDateUnsafe(item.createdAt),
        updatedAt: DateTime.fromDateUnsafe(item.updatedAt),
      })),
      limit,
      offset,
      total: totals.count,
    };
  });

export const getDraft = (draftId: string) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;

    const [foundDraft] = yield* db
      .select()
      .from(draft)
      .where(and(eq(draft.id, draftId), eq(draft.userId, user.id)))
      .limit(1)
      .pipe(Effect.orDie);

    if (!foundDraft) {
      return yield* new NotFound({ message: "Draft not found" });
    }

    return toDraft(foundDraft);
  });

/**
 * Maps the PATCH payload to a Drizzle update set. Drizzle ignores `undefined`
 * values, which is how JSON Merge Patch "omitted" fields are left unchanged.
 * Listing the columns explicitly keeps non-column payload keys out of the
 * update.
 */
const toUpdateSet = (payload: typeof UpdateDraftPayload.Type) => ({
  title: payload.title,
  content: payload.content,
  metaTitle: payload.metaTitle,
  metaDescription: payload.metaDescription,
  coverImage: payload.coverImage,
  tags: payload.tags,
  canonicalUri: payload.canonicalUri,
  updatedAt: new Date(),
});

export const updateDraft = (
  draftId: string,
  payload: typeof UpdateDraftPayload.Type,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;

    const [updatedDraft] = yield* db
      .update(draft)
      .set(toUpdateSet(payload))
      .where(and(eq(draft.id, draftId), eq(draft.userId, user.id)))
      .returning()
      .pipe(Effect.orDie);

    if (!updatedDraft) {
      return yield* new NotFound({ message: "Draft not found" });
    }

    return toDraft(updatedDraft);
  });

export const deleteDraft = (draftId: string) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;
    const posthog = yield* PostHogService;

    const [deletedDraft] = yield* db
      .delete(draft)
      .where(and(eq(draft.id, draftId), eq(draft.userId, user.id)))
      .returning({ id: draft.id })
      .pipe(Effect.orDie);

    if (!deletedDraft) {
      return yield* new NotFound({ message: "Draft not found" });
    }

    yield* posthog.capture({
      distinctId: user.id,
      event: "draft deleted",
      properties: {
        draftId,
      },
    });
  });

export const DraftsHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "drafts",
  (handlers) =>
    handlers
      .handle("create", ({ payload }) => createDraft(payload))
      .handle("list", ({ query }) => listDrafts(query))
      .handle("get", ({ params }) => getDraft(params.draftId))
      .handle("update", ({ params, payload }) =>
        updateDraft(params.draftId, payload),
      )
      .handle("delete", ({ params }) => deleteDraft(params.draftId)),
);
