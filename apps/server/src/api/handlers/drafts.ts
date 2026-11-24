import type { HttpServerRequest } from "effect/http";
import { createId } from "@paralleldrive/cuid2";
import { verifyMetadataSignature } from "@sigle/sdk";
import {
  and,
  count,
  desc,
  eq,
  isNull,
  lt,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import {
  Cause,
  Data,
  DateTime,
  Duration,
  Effect,
  ErrorReporter,
  Semaphore,
} from "effect";
import { HttpApiBuilder, HttpApiSchema } from "effect/http-api";
import { SigleApi } from "@/api";
import {
  CreateDraftPayload,
  DRAFT_CONTENT_TOTAL_MAX_MIB,
  DRAFT_COUNT_LIMIT,
  DRAFT_LIST_DEFAULT_LIMIT,
  DraftListQuery,
  PublishDraftPayload,
  UpdateDraftPayload,
} from "@/api/groups/drafts";
import { uploadImageFromRequest } from "@/api/image-upload";
import { CurrentUser } from "@/api/middleware/auth-user";
import { setRetryAfterHeader } from "@/api/middleware/rate-limit";
import {
  BadRequest,
  Conflict,
  Forbidden,
  NotFound,
  TooManyRequests,
} from "@/api/schemas";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { draft, post } from "@/db/schema";
import {
  PUBLISH_DRAFT_UPLOAD_CLAIM_LEASE_MILLIS,
  publishDraftJob,
} from "@/jobs/publish-draft";
import {
  DRAFT_IMAGE_MAX_MIB,
  draftImageKey,
  draftImageSettings,
} from "@/lib/draft-images";
import {
  findPlanPublishUsage,
  findUserPublishUsage,
  PUBLISH_LIMITS,
  type UserPlan,
} from "@/services/plan";
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
  contentWarning: row.contentWarning,
  publishStatus: row.txStatus,
  createdAt: DateTime.fromDateUnsafe(row.createdAt),
  updatedAt: DateTime.fromDateUnsafe(row.updatedAt),
});

/**
 * Fails when writing `content` to the user's draft `draftId` (a new draft
 * when undefined) would take their drafts' content over
 * `DRAFT_CONTENT_TOTAL_MAX_MIB`. A write that doesn't grow the draft's
 * content always passes, so a user over the limit can still shorten their
 * drafts. A soft limit like `DRAFT_COUNT_LIMIT`.
 */
const checkDraftContentTotal = (options: {
  readonly userId: string;
  readonly draftId?: string;
  readonly content: string;
}) =>
  Effect.gen(function* () {
    const db = yield* Database;
    const contentBytes = Buffer.byteLength(options.content);

    // `octet_length` reads the stored size of the text, not the text.
    const [usage] = yield* db
      .select({
        // The SQLite driver reads integers as bigint unless they're mapped.
        total:
          sql<number>`coalesce(sum(octet_length(${draft.content})), 0)`.mapWith(
            Number,
          ),
        current:
          sql<number>`coalesce(sum(CASE WHEN ${draft.id} = ${options.draftId ?? null} THEN octet_length(${draft.content}) END), 0)`.mapWith(
            Number,
          ),
      })
      .from(draft)
      .where(eq(draft.userId, options.userId))
      .pipe(Effect.orDie);

    if (
      contentBytes > usage.current &&
      usage.total - usage.current + contentBytes >
        DRAFT_CONTENT_TOTAL_MAX_MIB * 1024 * 1024
    ) {
      return yield* new Forbidden({
        message: `Your drafts can hold up to ${DRAFT_CONTENT_TOTAL_MAX_MIB} MiB of content in total. Delete or shorten a draft to save this one.`,
      });
    }
  });

export const createDraft = (payload: typeof CreateDraftPayload.Type) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;
    const posthog = yield* PostHogService;

    // A soft limit: concurrent creates can each pass the count, the
    // per-minute rate limit keeps the overshoot to a few drafts.
    const [totals] = yield* db
      .select({ count: count() })
      .from(draft)
      .where(eq(draft.userId, user.id))
      .pipe(Effect.orDie);

    if (totals.count >= DRAFT_COUNT_LIMIT) {
      return yield* new Forbidden({
        message: `You can have up to ${DRAFT_COUNT_LIMIT} drafts. Delete a draft to create a new one.`,
      });
    }

    yield* checkDraftContentTotal({
      userId: user.id,
      content: payload.content ?? "",
    });

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
        contentWarning: payload.contentWarning ?? null,
        userId: user.id,
      })
      .returning()
      .pipe(Effect.orDie);

    yield* posthog.capture({
      distinctId: user.id,
      event: "draft created",
      properties: {
        draftId: inserted.id,
      },
    });

    return HttpApiSchema.withHeaders({
      body: toDraft(inserted),
      headers: {
        location: `/api/drafts/${inserted.id}`,
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
        contentWarning: draft.contentWarning,
        publishStatus: draft.txStatus,
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
 * Maps the PATCH payload to the draft columns it changes. Drizzle ignores
 * `undefined` values, which is how JSON Merge Patch "omitted" fields are left
 * unchanged. Listing the columns explicitly keeps non-column payload keys out
 * of the update.
 */
const toUpdateFields = (payload: typeof UpdateDraftPayload.Type) => ({
  title: payload.title,
  content: payload.content,
  metaTitle: payload.metaTitle,
  metaDescription: payload.metaDescription,
  coverImage: payload.coverImage,
  tags: payload.tags,
  canonicalUri: payload.canonicalUri,
  contentWarning: payload.contentWarning,
});

export const updateDraft = (
  draftId: string,
  payload: typeof UpdateDraftPayload.Type,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;

    const fields = toUpdateFields(payload);

    // An empty patch changes nothing, so it must not bump `updatedAt` and
    // reorder the draft list.
    if (Object.values(fields).every((value) => value === undefined)) {
      return yield* getDraft(draftId);
    }

    if (fields.content !== undefined) {
      yield* checkDraftContentTotal({
        userId: user.id,
        draftId,
        content: fields.content,
      });
    }

    // A publish signs a snapshot of the draft and deletes the draft once the
    // post is stored, so a save accepted while it runs would be lost. The
    // status is checked in the same statement as the write.
    const [updatedDraft] = yield* db
      .update(draft)
      .set({ ...fields, updatedAt: new Date() })
      .where(
        and(
          eq(draft.id, draftId),
          eq(draft.userId, user.id),
          or(
            isNull(draft.txStatus),
            notInArray(draft.txStatus, ["PENDING", "PROCESSING"]),
          ),
        ),
      )
      .returning()
      .pipe(Effect.orDie);

    if (updatedDraft) {
      return toDraft(updatedDraft);
    }

    const [foundDraft] = yield* db
      .select({ id: draft.id })
      .from(draft)
      .where(and(eq(draft.id, draftId), eq(draft.userId, user.id)))
      .limit(1)
      .pipe(Effect.orDie);

    if (!foundDraft) {
      return yield* new NotFound({ message: "Draft not found" });
    }

    return yield* new Conflict({
      message:
        "This draft is being published, changes can be saved once publishing finishes.",
    });
  });

export const deleteDraft = (draftId: string) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;
    const posthog = yield* PostHogService;

    // Deleting a draft while it is being published would orphan its Arweave
    // upload: the job finds no draft to finalize and never stores the post.
    const [deletedDraft] = yield* db
      .delete(draft)
      .where(
        and(
          eq(draft.id, draftId),
          eq(draft.userId, user.id),
          or(
            isNull(draft.txStatus),
            notInArray(draft.txStatus, ["PENDING", "PROCESSING"]),
          ),
        ),
      )
      .returning({ id: draft.id })
      .pipe(Effect.orDie);

    if (!deletedDraft) {
      const [foundDraft] = yield* db
        .select({ id: draft.id })
        .from(draft)
        .where(and(eq(draft.id, draftId), eq(draft.userId, user.id)))
        .limit(1)
        .pipe(Effect.orDie);

      if (!foundDraft) {
        return yield* new NotFound({ message: "Draft not found" });
      }

      return yield* new Conflict({
        message:
          "This draft is being published, it can be deleted once publishing finishes.",
      });
    }

    yield* posthog.capture({
      distinctId: user.id,
      event: "draft deleted",
      properties: {
        draftId,
      },
    });
  });

/**
 * Fails with a 429 for a daily limit, with a `Retry-After` of when the oldest
 * counted publish leaves the window.
 */
const failOverDailyLimit = (
  usage: { readonly resetsAt: Date | null },
  now: Date,
  message: string,
) =>
  Effect.gen(function* () {
    const retryAfterMillis = Math.max(
      0,
      (usage.resetsAt?.getTime() ?? now.getTime()) - now.getTime(),
    );

    yield* setRetryAfterHeader(Duration.millis(retryAfterMillis));

    return yield* new TooManyRequests({ message, retryAfterMillis });
  });

/**
 * Reported to PostHog when the global publish limit of a plan rejects a
 * publish, so we know users are being turned away.
 */
class GlobalPublishLimitReached extends Data.TaggedError(
  "GlobalPublishLimitReached",
)<{
  readonly plan: UserPlan;
  readonly limit: number;
  readonly message: string;
}> {
  readonly [ErrorReporter.severity] = "Warn" as const;
  readonly [ErrorReporter.attributes] = { plan: this.plan, limit: this.limit };
}

/**
 * Reports once per plan and hour per server process: while a limit is
 * reached every publish of the plan is rejected, and reporting each would
 * spend the error tracking quota.
 */
const GLOBAL_PUBLISH_LIMIT_REPORT_INTERVAL_MILLIS = 60 * 60 * 1000;

const globalPublishLimitReportedAt = new Map<UserPlan, number>();

const reportGlobalPublishLimitReached = ({
  plan,
  limit,
  now,
}: {
  readonly plan: UserPlan;
  readonly limit: number;
  readonly now: Date;
}) =>
  Effect.suspend(() => {
    const reportedAt = globalPublishLimitReportedAt.get(plan);

    if (
      reportedAt !== undefined &&
      now.getTime() - reportedAt < GLOBAL_PUBLISH_LIMIT_REPORT_INTERVAL_MILLIS
    ) {
      return Effect.void;
    }

    globalPublishLimitReportedAt.set(plan, now.getTime());

    return ErrorReporter.report(
      Cause.fail(
        new GlobalPublishLimitReached({
          plan,
          limit,
          message: `The ${plan} plan reached its global limit of ${limit} publishes per 24 hours, publishes are rejected`,
        }),
      ),
    );
  });

/**
 * Serializes counting the publish limits and claiming the draft, so
 * concurrent publishes from different wallets can't all read the same usage
 * before any of them claims its draft and together exceed the global limit.
 * The queries are synchronous today, so they rarely interleave, but nothing
 * guarantees it: the scheduler can yield between them, and an async call
 * added between them would reopen the gap. The API runs as a single process
 * on its SQLite file, so an in-process lock is enough; it is held for a few
 * queries.
 */
const publishLock = Semaphore.makeUnsafe(1);

export const publishDraft = (
  draftId: string,
  payload: typeof PublishDraftPayload.Type,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const config = yield* AppConfig;
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

    const { metadata } = payload;

    if (metadata.content.id !== draftId) {
      return yield* new BadRequest({
        message: "Post metadata content id does not match the draft",
      });
    }

    const signatureResult = verifyMetadataSignature(metadata, {
      network: config.STACKS_ENV === "mainnet" ? "mainnet" : "testnet",
    });

    if (signatureResult.isErr()) {
      return yield* new BadRequest({
        message: signatureResult.error.error,
      });
    }

    const { recoveredAddress, signature } = signatureResult.value;

    if (!user.walletAddresses.includes(recoveredAddress)) {
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
      return yield* new Conflict({
        message: "Metadata signature has already been published",
      });
    }

    // Counting the limits and claiming the draft is one step, see
    // `publishLock`.
    const acceptedDraft = yield* publishLock.withPermit(
      Effect.gen(function* () {
        const { plan } = user;
        const limit = PUBLISH_LIMITS[plan];
        const now = new Date();

        const usage = yield* findUserPublishUsage(db, {
          userId: user.id,
          now,
          excludeDraftId: draftId,
        });

        if (usage.used >= limit) {
          return yield* failOverDailyLimit(
            usage,
            now,
            plan === "free"
              ? `You can publish ${limit} posts per day on the Free plan. Try again later, or upgrade to Pro to publish up to ${PUBLISH_LIMITS.pro} posts per day.`
              : `You can publish ${limit} posts per day on the Pro plan. Try again later.`,
          );
        }

        const globalLimit =
          plan === "free"
            ? config.PUBLISH_GLOBAL_DAILY_LIMIT_FREE
            : config.PUBLISH_GLOBAL_DAILY_LIMIT_PRO;

        const globalUsage = yield* findPlanPublishUsage(db, {
          plan,
          now,
          excludeDraftId: draftId,
        });

        if (globalUsage.used >= globalLimit) {
          yield* reportGlobalPublishLimitReached({
            plan,
            limit: globalLimit,
            now,
          });

          return yield* failOverDailyLimit(
            globalUsage,
            now,
            plan === "free"
              ? "Sigle reached today's publishing limit for Free accounts. Try again later, or upgrade to Pro to keep publishing."
              : "Sigle reached today's publishing limit for Pro accounts. Try again later.",
          );
        }

        // Take ownership of the draft row: `publishSignature` identifies the signed
        // payload being published, and the Arweave checkpoint/upload claim only
        // survive while they belong to that payload. Workers whose job signature no
        // longer matches the draft no-op, so the newest request wins without any
        // queue reconciliation, which also recovers a draft stuck in flight. The
        // CASE reads the current row, so a checkpoint or in-flight upload claim
        // from the same signature is never clobbered. Another signature cannot
        // take over while a worker holds the upload claim, or while a checkpointed
        // upload waits for a worker to create the post, including after a retry
        // of the same signature reset the status to PENDING: either way an
        // Arweave upload paid for would be discarded. A FAILED publish has no
        // worker left, and both checks expire after the claim lease, so a worker
        // that crashed doesn't block the draft forever. Both run in the same
        // statement as the write.
        const leaseCutoff = new Date(
          now.getTime() - PUBLISH_DRAFT_UPLOAD_CLAIM_LEASE_MILLIS,
        );

        const [claimedDraft] = yield* db
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
            updatedAt: now,
          })
          .where(
            and(
              eq(draft.id, draftId),
              eq(draft.userId, user.id),
              or(
                eq(draft.publishSignature, signature),
                and(
                  or(
                    isNull(draft.uploadClaimedAt),
                    lt(draft.uploadClaimedAt, leaseCutoff),
                  ),
                  // The checkpoint write and every accepted publish set
                  // `updatedAt`.
                  or(
                    isNull(draft.arweaveTxId),
                    eq(draft.txStatus, "FAILED"),
                    lt(draft.updatedAt, leaseCutoff),
                  ),
                ),
              ),
            ),
          )
          .returning({ id: draft.id })
          .pipe(Effect.orDie);

        return claimedDraft;
      }),
    );

    if (!acceptedDraft) {
      const [currentDraft] = yield* db
        .select({ id: draft.id })
        .from(draft)
        .where(and(eq(draft.id, draftId), eq(draft.userId, user.id)))
        .limit(1)
        .pipe(Effect.orDie);

      if (!currentDraft) {
        return yield* new NotFound({ message: "Draft not found" });
      }

      return yield* new Conflict({
        message:
          "This draft is being published to Arweave, it can be published again once that finishes.",
      });
    }

    yield* publishDraftJob
      .offer({
        draftId,
        userId: user.id,
        authorAddress: recoveredAddress,
        signature,
        metadataJson: JSON.stringify(metadata),
      })
      .pipe(Effect.orDie);

    return HttpApiSchema.withHeaders({
      body: { draftId, status: "pending" as const },
      headers: { location: `/api/drafts/${draftId}/publish` },
    });
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
        arweaveTxId: publishedPost.arweaveTxId,
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
        arweaveTxId: foundDraft.arweaveTxId,
      } as const;
    }

    // The publish status is a resource of the publish job: a draft that was
    // never published has none.
    return yield* new NotFound({
      message: "Draft publishing has not been started",
    });
  });

export const uploadDraftImage = (
  draftId: string,
  request: HttpServerRequest.HttpServerRequest,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const config = yield* AppConfig;
    const db = yield* Database;
    const posthog = yield* PostHogService;

    const [foundDraft] = yield* db
      .select({ id: draft.id })
      .from(draft)
      .where(and(eq(draft.id, draftId), eq(draft.userId, user.id)))
      .limit(1)
      .pipe(Effect.orDie);

    if (!foundDraft) {
      return yield* new NotFound({ message: "Draft not found" });
    }

    // Checked before reading the body so free users are rejected without
    // processing the image.
    if (user.plan !== "pro") {
      return yield* new Forbidden({
        message:
          "Image uploads are available on the Pro plan. Embed an image from a URL instead.",
      });
    }

    const uploaded = yield* uploadImageFromRequest(request, {
      ...draftImageSettings(config.STACKS_ENV),
      maxMib: DRAFT_IMAGE_MAX_MIB,
      key: (version) => draftImageKey(user.id, draftId, version),
      url: (stored) => stored.url,
    });

    yield* posthog.capture({
      distinctId: user.id,
      event: "draft media uploaded",
      properties: {
        draftId,
        key: uploaded.key,
        sizeBytes: uploaded.sizeBytes,
        url: uploaded.url,
      },
    });

    return {
      height: uploaded.height,
      sizeBytes: uploaded.sizeBytes,
      thumbhash: uploaded.thumbhash,
      url: uploaded.url,
      width: uploaded.width,
    };
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
      )
      .handle("uploadImage", ({ params, request }) =>
        uploadDraftImage(params.draftId, request),
      ),
);
