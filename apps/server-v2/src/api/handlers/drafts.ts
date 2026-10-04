import { createId } from "@paralleldrive/cuid2";
import { PostMetadataSchema, verifyMetadataSignature } from "@sigle/sdk";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { DateTime, Effect } from "effect";
import { HttpApiBuilder, HttpApiSchema } from "effect/http-api";
import { SigleApi } from "@/api";
import {
  CreateDraftPayload,
  DRAFT_LIST_DEFAULT_LIMIT,
  DraftListQuery,
  PublishDraftPayload,
  UpdateDraftPayload,
} from "@/api/groups/drafts";
import { CurrentUser } from "@/api/middleware/auth-user";
import { BadRequest, NotFound } from "@/api/schemas";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { draft, post } from "@/db/schema";
import { publishDraftJob } from "@/jobs/publish-draft";
import { PostHogService } from "@/services/posthog";
import { UserWhitelistService } from "@/services/users";

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

export const publishDraft = (
  draftId: string,
  payload: typeof PublishDraftPayload.Type,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const config = yield* AppConfig;
    const db = yield* Database;
    const whitelist = yield* UserWhitelistService;

    const [foundDraft] = yield* db
      .select()
      .from(draft)
      .where(and(eq(draft.id, draftId), eq(draft.userId, user.id)))
      .limit(1)
      .pipe(Effect.orDie);

    if (!foundDraft) {
      return yield* new NotFound({ message: "Draft not found" });
    }

    const parsedMetadata = PostMetadataSchema.safeParse(payload.metadata);

    if (!parsedMetadata.success) {
      return yield* new BadRequest({
        message: "Invalid post metadata",
      });
    }

    if (parsedMetadata.data.content.id !== draftId) {
      return yield* new BadRequest({
        message: "Post metadata content id does not match the draft",
      });
    }

    const signatureResult = verifyMetadataSignature(parsedMetadata.data, {
      network: config.STACKS_ENV === "mainnet" ? "mainnet" : "testnet",
    });

    if (signatureResult.isErr()) {
      return yield* new BadRequest({
        message: signatureResult.error.error,
      });
    }

    const { recoveredAddress, signature } = signatureResult.value;

    const ownsWallet = yield* whitelist.hasWalletAddress(
      user.id,
      recoveredAddress,
    );

    if (!ownsWallet) {
      return yield* new BadRequest({
        message:
          "Invalid signature: Signature verification failed or address mismatch",
      });
    }

    const [existingPostWithSignature] = yield* db
      .select({ id: post.id })
      .from(post)
      .where(eq(post.signature, signature))
      .limit(1)
      .pipe(Effect.orDie);

    if (existingPostWithSignature) {
      return yield* new BadRequest({
        message: "Metadata signature has already been published",
      });
    }

    // Take ownership of the draft row: `publishSignature` identifies the signed
    // payload being published, and the Arweave checkpoint/upload claim only
    // survive while they belong to that payload. Workers whose job signature no
    // longer matches the draft no-op, so the newest request wins without any
    // queue reconciliation. The CASE reads the current row, so a checkpoint or
    // in-flight upload claim from the same signature is never clobbered.
    const [acceptedDraft] = yield* db
      .update(draft)
      .set({
        txStatus: "PENDING",
        publishSignature: signature,
        arweaveTxId: sql`CASE
          WHEN ${draft.publishSignature} = ${signature} THEN ${draft.arweaveTxId}
          ELSE NULL
        END`,
        uploadClaimedAt: sql`CASE
          WHEN ${draft.publishSignature} = ${signature} THEN ${draft.uploadClaimedAt}
          ELSE NULL
        END`,
        updatedAt: new Date(),
      })
      .where(and(eq(draft.id, draftId), eq(draft.userId, user.id)))
      .returning({ id: draft.id })
      .pipe(Effect.orDie);

    if (!acceptedDraft) {
      return yield* new NotFound({ message: "Draft not found" });
    }

    yield* publishDraftJob
      .offer({
        draftId,
        userId: user.id,
        authorAddress: recoveredAddress,
        signature,
        metadataJson: JSON.stringify(parsedMetadata.data),
      })
      .pipe(Effect.orDie);

    return {
      draftId,
      status: "PENDING" as const,
    };
  });

export const getDraftPublishStatus = (draftId: string) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;

    const [publishedPost] = yield* db
      .select({ id: post.id, arweaveTxId: post.arweaveTxId })
      .from(post)
      .where(and(eq(post.draftId, draftId), eq(post.userId, user.id)))
      .limit(1)
      .pipe(Effect.orDie);

    if (publishedPost) {
      return {
        status: "COMPLETED" as const,
        postId: publishedPost.id,
        arweaveId: publishedPost.arweaveTxId,
      };
    }

    const [foundDraft] = yield* db
      .select({ txStatus: draft.txStatus, arweaveTxId: draft.arweaveTxId })
      .from(draft)
      .where(and(eq(draft.id, draftId), eq(draft.userId, user.id)))
      .limit(1)
      .pipe(Effect.orDie);

    if (!foundDraft) {
      return yield* new NotFound({ message: "Draft not found" });
    }

    if (
      foundDraft.txStatus === "PENDING" ||
      foundDraft.txStatus === "PROCESSING" ||
      foundDraft.txStatus === "FAILED"
    ) {
      return {
        status: foundDraft.txStatus,
        postId: null,
        arweaveId: foundDraft.arweaveTxId,
      } as const;
    }

    return yield* new BadRequest({
      message: "Draft publishing has not been started",
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
      .handle("delete", ({ params }) => deleteDraft(params.draftId))
      .handle("publish", ({ params, payload }) =>
        publishDraft(params.draftId, payload),
      )
      .handle("getPublishStatus", ({ params }) =>
        getDraftPublishStatus(params.draftId),
      ),
);
