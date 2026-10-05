import { PostMetadataSchema } from "@sigle/sdk";
import { and, eq, isNull, lt, or } from "drizzle-orm";
import { Data, Effect, Layer, Schedule, Schema } from "effect";
import { Database } from "@/db";
import { draft, mediaImage, post, postOts } from "@/db/schema";
import { sha256Hex } from "@/lib/hash";
import { defineJob, terminal, type TerminalJobError } from "@/queue/core";
import { ArweaveService, type ArweaveUploadError } from "@/services/arweave";
import { PostHogService } from "@/services/posthog";
import {
  generateImageThumbhashJob,
  thumbhashJobId,
} from "./generate-image-thumbhash";
import { opentimestampsStampJob, otsStampJobId } from "./opentimestamps-stamp";

export const PUBLISH_DRAFT_QUEUE_NAME = "publish-draft";

export const PUBLISH_DRAFT_MAX_ATTEMPTS = 3;

export const PublishDraftJobSchema = Schema.Struct({
  draftId: Schema.String,
  userId: Schema.String,
  authorAddress: Schema.String,
  signature: Schema.String,
  metadataJson: Schema.String,
});

export type PublishDraftJob = typeof PublishDraftJobSchema.Type;

class InvalidPublishMetadataError extends Data.TaggedError(
  "InvalidPublishMetadataError",
)<{
  readonly message: string;
  readonly cause: unknown;
}> {}

/**
 * Retryable error returned when another worker holds a fresh upload claim for
 * the same draft and publish signature. The queue backs off and retries; by
 * then the holder has either checkpointed the upload (reuse) or its claim has
 * expired (reclaim).
 */
export class PublishDraftUploadClaimedError extends Data.TaggedError(
  "PublishDraftUploadClaimedError",
)<{
  readonly draftId: string;
}> {}

/**
 * Lease duration for the Arweave upload claim. A claim older than this is
 * considered abandoned (crashed worker) and can be taken over. Kept in line
 * with the queue's lock expiration so a worker that crashed mid-upload can be
 * replaced as soon as its queue row is re-taken.
 */
const PUBLISH_DRAFT_UPLOAD_CLAIM_LEASE_MILLIS = 2 * 60 * 1000;

const publishDraftRetrySchedule: Schedule.Schedule<unknown, number> =
  Schedule.jittered(
    Schedule.min([
      Schedule.exponential("5 seconds"),
      Schedule.spaced("2 minutes"),
    ]),
  );

/**
 * Returns the published post and its cover image URL when this call created
 * the post, or `undefined` when there was nothing to do (draft superseded,
 * already finalized by another attempt, ...).
 */
export const processPublishDraftJob = (
  job: PublishDraftJob,
): Effect.Effect<
  { readonly postId: string; readonly coverImage: string | null } | undefined,
  ArweaveUploadError | PublishDraftUploadClaimedError | TerminalJobError,
  Database | ArweaveService | PostHogService
> =>
  Effect.gen(function* () {
    const db = yield* Database;
    const arweave = yield* ArweaveService;
    const posthog = yield* PostHogService;

    const [foundDraft] = yield* db
      .select({
        id: draft.id,
        arweaveTxId: draft.arweaveTxId,
        publishSignature: draft.publishSignature,
      })
      .from(draft)
      .where(and(eq(draft.id, job.draftId), eq(draft.userId, job.userId)))
      .limit(1)
      .pipe(Effect.orDie);

    // Missing draft or a newer publish took ownership: nothing to do.
    if (!foundDraft || foundDraft.publishSignature !== job.signature) {
      return;
    }

    const postData = yield* Effect.try({
      try: () => PostMetadataSchema.parse(JSON.parse(job.metadataJson)),
      catch: (cause) =>
        terminal(
          new InvalidPublishMetadataError({
            message: cause instanceof Error ? cause.message : String(cause),
            cause,
          }),
        ),
    });

    // Step 1: Upload metadata JSON to Arweave (or reuse checkpointed txId from
    // an earlier attempt if a downstream step failed and triggered a retry).
    // Concurrent workers for the same signed payload must not both call
    // `uploadFile`, so the uploader is elected with a leased claim on the draft
    // row. The claim token also fences the checkpoint/release writes: a worker
    // whose claim was taken over (stale lease) cannot clobber the new holder.
    let arweaveTxId = foundDraft.arweaveTxId;

    if (arweaveTxId === null) {
      const claimedAt = new Date();

      const staleClaimCutoff = new Date(
        claimedAt.getTime() - PUBLISH_DRAFT_UPLOAD_CLAIM_LEASE_MILLIS,
      );

      const [claimed] = yield* db
        .update(draft)
        .set({
          uploadClaimedAt: claimedAt,
          txStatus: "PROCESSING",
          updatedAt: claimedAt,
        })
        .where(
          and(
            eq(draft.id, job.draftId),
            eq(draft.userId, job.userId),
            eq(draft.publishSignature, job.signature),
            isNull(draft.arweaveTxId),
            or(
              isNull(draft.uploadClaimedAt),
              lt(draft.uploadClaimedAt, staleClaimCutoff),
            ),
          ),
        )
        .returning({ id: draft.id })
        .pipe(Effect.orDie);

      if (!claimed) {
        return yield* new PublishDraftUploadClaimedError({
          draftId: job.draftId,
        });
      }

      const uploaded = yield* arweave
        .uploadFile({
          file: Buffer.from(job.metadataJson),
          contentType: "application/json",
          tags: [
            {
              name: "Author",
              value: job.authorAddress,
            },
          ],
        })
        // Release the claim before failing so the queue retry can reclaim it
        // immediately instead of waiting for the lease to expire. A crashed
        // worker leaves the claim behind; it is reclaimed after the lease.
        .pipe(
          Effect.tapError(() =>
            db
              .update(draft)
              .set({ uploadClaimedAt: null, updatedAt: new Date() })
              .where(
                and(
                  eq(draft.id, job.draftId),
                  eq(draft.userId, job.userId),
                  eq(draft.publishSignature, job.signature),
                  eq(draft.uploadClaimedAt, claimedAt),
                ),
              )
              .pipe(Effect.orDie),
          ),
        );

      const [checkpointed] = yield* db
        .update(draft)
        .set({
          arweaveTxId: uploaded.id,
          txStatus: "PROCESSING",
          uploadClaimedAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(draft.id, job.draftId),
            eq(draft.userId, job.userId),
            eq(draft.publishSignature, job.signature),
            eq(draft.uploadClaimedAt, claimedAt),
          ),
        )
        .returning({ id: draft.id })
        .pipe(Effect.orDie);

      if (!checkpointed) {
        return;
      }

      arweaveTxId = uploaded.id;
    }

    const attributes = postData.content.attributes ?? [];

    const findAttribute = (key: string): string | undefined =>
      attributes.find((attribute) => attribute.key === key)?.value;

    const metaTitle = findAttribute("meta-title") ?? null;
    const metaDescription = findAttribute("meta-description") ?? null;
    const excerpt = findAttribute("excerpt") ?? "";
    const canonicalUri = findAttribute("canonical-uri") ?? null;
    const coverImage = postData.content.coverImage?.url ?? null;

    const versionSplit = postData.$schema.split("/");
    const version = (versionSplit.at(-1) ?? "1.0.0").replace(".json", "");

    // Step 2: Atomically delete the draft and insert the published post.
    const finalized = yield* db
      .transaction((tx) =>
        Effect.gen(function* () {
          const [deletedDraft] = yield* tx
            .delete(draft)
            .where(
              and(
                eq(draft.id, job.draftId),
                eq(draft.userId, job.userId),
                eq(draft.publishSignature, job.signature),
              ),
            )
            .returning({ id: draft.id });

          if (!deletedDraft) {
            return false;
          }

          yield* tx.insert(post).values({
            id: arweaveTxId,
            draftId: job.draftId,
            version,
            arweaveTxId,
            metadataUri: `ar://${arweaveTxId}`,
            title: postData.content.title,
            content: postData.content.content,
            excerpt,
            metaTitle,
            metaDescription,
            coverImage,
            tags: postData.content.tags ?? [],
            canonicalUri,
            signature: job.signature,
            userId: job.userId,
          });

          // The exact JSON bytes uploaded above are what OpenTimestamps
          // anchors, so the hash is captured in the same transaction as the
          // post itself.
          yield* tx.insert(postOts).values({
            postId: arweaveTxId,
            status: "PENDING",
            contentHash: sha256Hex(Buffer.from(job.metadataJson)),
          });

          // Cover image metadata is created alongside the post so readers can
          // see a placeholder as soon as the post exists. The thumbhash job
          // fills it in; an existing READY row for a reused cover is kept.
          if (coverImage !== null) {
            yield* tx
              .insert(mediaImage)
              .values({
                id: coverImage,
                mimeType: postData.content.coverImage?.type ?? null,
              })
              .onConflictDoNothing();
          }

          return true;
        }),
      )
      .pipe(Effect.orDie);

    if (!finalized) {
      return;
    }

    yield* posthog.capture({
      distinctId: job.userId,
      event: "draft published",
      properties: {
        draftId: job.draftId,
        postId: arweaveTxId,
        arweaveId: arweaveTxId,
      },
    });

    return { coverImage, postId: arweaveTxId };
  });

export const markDraftPublishFailed = (
  job: PublishDraftJob,
): Effect.Effect<void, never, Database> =>
  Effect.gen(function* () {
    const db = yield* Database;
    // The active upload claim is intentionally left untouched: only its owner
    // (on success or error) or lease expiry may release it, otherwise a
    // competing job could clear a live uploader's claim and double-upload.
    yield* db
      .update(draft)
      .set({
        txStatus: "FAILED",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(draft.id, job.draftId),
          eq(draft.userId, job.userId),
          eq(draft.publishSignature, job.signature),
        ),
      )
      .pipe(
        Effect.retry({
          schedule: Schedule.exponential("100 millis"),
          times: 3,
        }),
        Effect.catchCause((cause) =>
          Effect.logError(
            `Failed to mark draft ${job.draftId} as FAILED`,
            cause,
          ),
        ),
      );
  });

export const publishDraftJob = defineJob({
  name: PUBLISH_DRAFT_QUEUE_NAME,
  payload: PublishDraftJobSchema,
  maxAttempts: PUBLISH_DRAFT_MAX_ATTEMPTS,
  retrySchedule: publishDraftRetrySchedule,
  concurrency: 2,
  process: (job) =>
    Effect.gen(function* () {
      const published = yield* processPublishDraftJob(job);

      if (published === undefined) {
        return;
      }

      yield* opentimestampsStampJob
        .offer(
          { postId: published.postId },
          { id: otsStampJobId(published.postId) },
        )
        .pipe(Effect.orDie);

      if (published.coverImage !== null) {
        yield* generateImageThumbhashJob
          .offer(
            { imageId: published.coverImage },
            { id: thumbhashJobId(published.coverImage) },
          )
          .pipe(Effect.orDie);
      }
    }),
  onFinalFailure: (job) => markDraftPublishFailed(job),
  reportPayload: (job) => ({ draftId: job.draftId }),
});

export const PublishDraftWorkerLive = publishDraftJob
  .workerLayer()
  .pipe(
    Layer.provideMerge(publishDraftJob.layer),
    Layer.provideMerge(opentimestampsStampJob.layer),
    Layer.provideMerge(generateImageThumbhashJob.layer),
  );
