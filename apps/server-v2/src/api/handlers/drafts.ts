import { createId } from "@paralleldrive/cuid2";
import { and, desc, eq } from "drizzle-orm";
import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { SigleApi } from "@/api";
import { UpdateDraftPayload } from "@/api/groups/drafts";
import { CurrentUser } from "@/api/middleware/auth-user";
import { NotFound } from "@/api/schemas";
import { Database } from "@/db";
import { draft } from "@/db/schema";
import { PostHogService } from "@/services/posthog";

export const createDraft = Effect.gen(function* () {
  const user = yield* CurrentUser;
  const db = yield* Database;
  const posthog = yield* PostHogService;

  const [inserted] = yield* db
    .insert(draft)
    .values({
      // Move to native @default cuid2 once drizzle supports it.
      id: createId(),
      title: "",
      content: "",
      userId: user.id,
    })
    .returning({ id: draft.id })
    .pipe(Effect.orDie);

  yield* posthog.capture({
    distinctId: user.id,
    event: "draft created",
    properties: {
      postId: inserted.id,
    },
  });

  return inserted;
});

export const listDrafts = (limit: number) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;

    const drafts = yield* db
      .select({
        id: draft.id,
        title: draft.title,
        content: draft.content,
        metaTitle: draft.metaTitle,
        metaDescription: draft.metaDescription,
        coverImage: draft.coverImage,
        txId: draft.txId,
        txStatus: draft.txStatus,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      })
      .from(draft)
      .where(eq(draft.userId, user.id))
      .orderBy(desc(draft.updatedAt))
      .limit(limit)
      .pipe(Effect.orDie);

    return drafts.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  });

export const getDraft = (draftId: string) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;

    const [foundDraft] = yield* db
      .select({
        id: draft.id,
        title: draft.title,
        content: draft.content,
        metaTitle: draft.metaTitle,
        metaDescription: draft.metaDescription,
        coverImage: draft.coverImage,
        tags: draft.tags,
        canonicalUri: draft.canonicalUri,
        txId: draft.txId,
        txStatus: draft.txStatus,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      })
      .from(draft)
      .where(and(eq(draft.id, draftId), eq(draft.userId, user.id)))
      .limit(1)
      .pipe(Effect.orDie);

    if (!foundDraft) {
      return yield* new NotFound({ message: "Not Found" });
    }

    return {
      ...foundDraft,
      type: "draft" as const,
      createdAt: foundDraft.createdAt.toISOString(),
      updatedAt: foundDraft.updatedAt.toISOString(),
    };
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
      .set({
        title: payload.title,
        content: payload.content,
        metaTitle: payload.metaTitle,
        metaDescription: payload.metaDescription,
        coverImage: payload.coverImage,
        tags: payload.tags === undefined ? undefined : [...payload.tags],
        canonicalUri: payload.canonicalUri,
        updatedAt: new Date(),
      })
      .where(and(eq(draft.id, draftId), eq(draft.userId, user.id)))
      .returning({ id: draft.id })
      .pipe(Effect.orDie);

    if (!updatedDraft) {
      return yield* new NotFound({ message: "Not Found" });
    }

    return updatedDraft;
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
      return yield* new NotFound({ message: "Not Found" });
    }

    yield* posthog.capture({
      distinctId: user.id,
      event: "draft deleted",
      properties: {
        draftId,
      },
    });

    return true;
  });

export const DraftsHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "drafts",
  (handlers) =>
    handlers
      .handle("create", () => createDraft)
      .handle("list", ({ query }) => listDrafts(query.limit))
      .handle("get", ({ params }) => getDraft(params.draftId))
      .handle("update", ({ params, payload }) =>
        updateDraft(params.draftId, payload),
      )
      .handle("delete", ({ params }) => deleteDraft(params.draftId)),
);
