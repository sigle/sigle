import { ArweaveTags } from "@sigle/sdk";
import { and, eq } from "drizzle-orm";
import { Data, Effect, Layer, Schedule, Schema } from "effect";
import type { TerminalJobError } from "@/queue/core";
import type { ArweaveUploadError } from "@/services/arweave";
import { Database } from "@/db";
import { draft, mediaImage, post, postOts } from "@/db/schema";
import { sha256Hex } from "@/lib/hash";
import { PostMetadata, postFieldsFromMetadata } from "@/lib/metadata";
import { defineJob, terminal } from "@/queue/core";
import { ArweaveService } from "@/services/arweave";
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
  // The draft's `publishGeneration` this job publishes.
  generation: Schema.Int,
});

export type PublishDraftJob = typeof PublishDraftJobSchema.Type;

/**
 * One queue job per accepted publish generation. Offering the same generation
 * again (a duplicate request) is deduplicated by the queue.
 */
export const publishDraftJobId = (
  draftId: string,
  generation: number,
): string => `publish-draft:${draftId}:${generation}`;

/**
 * A publish still PENDING or PROCESSING after this long has no live job: a
 * job bumps `updatedAt` at the start of each attempt, and its attempts and
 * retries take a few minutes at most (60 s upload timeout, retries backing
 * off to 2 minutes). A new publish may then replace it.
 */
export const PUBLISH_DRAFT_STALE_MILLIS = 10 * 60 * 1000;

const decodePostMetadataJson = Schema.decodeUnknownEffect(
  Schema.fromJsonString(PostMetadata),
);

class InvalidPublishMetadataError extends Data.TaggedError(
  "InvalidPublishMetadataError",
)<{
  readonly message: string;
  readonly cause: unknown;
}> {}

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
  ArweaveUploadError | TerminalJobError,
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
        publishGeneration: draft.publishGeneration,
      })
      .from(draft)
      .where(and(eq(draft.id, job.draftId), eq(draft.userId, job.userId)))
      .limit(1)
      .pipe(Effect.orDie);

    // Missing draft (already finalized) or a newer publish generation replaced
    // this one: nothing to do.
    if (!foundDraft || foundDraft.publishGeneration !== job.generation) {
      return;
    }

    const postData = yield* decodePostMetadataJson(job.metadataJson).pipe(
      Effect.mapError((cause) =>
        terminal(
          new InvalidPublishMetadataError({ message: cause.message, cause }),
        ),
      ),
    );

    // Each publish generation has exactly one queue job, and the queue lock
    // keeps a job on a single worker, so no claim on the draft is needed. Every
    // draft write below is fenced by the generation, so a job replaced by a
    // newer publish of the draft cannot touch it.
    const forThisGeneration = and(
      eq(draft.id, job.draftId),
      eq(draft.userId, job.userId),
      eq(draft.publishGeneration, job.generation),
    );

    // Step 1: Upload metadata JSON to Arweave, or reuse the checkpointed txId
    // from an earlier attempt. An attempt interrupted mid-upload (deploy) is
    // retaken and uploads again.
    let arweaveTxId = foundDraft.arweaveTxId;

    if (arweaveTxId === null) {
      const [processing] = yield* db
        .update(draft)
        .set({ txStatus: "PROCESSING", updatedAt: new Date() })
        .where(forThisGeneration)
        .returning({ id: draft.id })
        .pipe(Effect.orDie);

      if (!processing) {
        return;
      }

      const uploaded = yield* arweave.uploadFile({
        file: Buffer.from(job.metadataJson),
        contentType: "application/json",
        tags: [
          {
            name: ArweaveTags.author,
            value: job.authorAddress,
          },
        ],
      });

      const [checkpointed] = yield* db
        .update(draft)
        .set({ arweaveTxId: uploaded.id, updatedAt: new Date() })
        .where(forThisGeneration)
        .returning({ id: draft.id })
        .pipe(Effect.orDie);

      if (!checkpointed) {
        return;
      }

      arweaveTxId = uploaded.id;
    }

    const fields = postFieldsFromMetadata(postData);
    // The post keeps the id of its draft, which the publish handler checked is
    // the `content.id` of its metadata, so its URL doesn't change when a new
    // revision is published.
    const postId = job.draftId;

    // Step 2: Atomically delete the draft and insert the published post.
    const finalized = yield* db
      .transaction((tx) =>
        Effect.gen(function* () {
          const [deletedDraft] = yield* tx
            .delete(draft)
            .where(forThisGeneration)
            .returning({ id: draft.id });

          if (!deletedDraft) {
            return false;
          }

          yield* tx.insert(post).values({
            id: postId,
            draftId: job.draftId,
            version: fields.version,
            arweaveTxId,
            metadataUri: `ar://${arweaveTxId}`,
            title: fields.title,
            content: fields.content,
            excerpt: fields.excerpt,
            metaTitle: fields.metaTitle,
            metaDescription: fields.metaDescription,
            coverImage: fields.coverImage,
            tags: fields.tags,
            canonicalUri: fields.canonicalUri,
            contentWarning: postData.content.contentWarning ?? null,
            signature: job.signature,
            userId: job.userId,
          });

          // The exact JSON bytes uploaded above are what OpenTimestamps
          // anchors, so the hash is captured in the same transaction as the
          // post itself.
          yield* tx.insert(postOts).values({
            postId,
            status: "PENDING",
            contentHash: sha256Hex(Buffer.from(job.metadataJson)),
          });

          // Cover image metadata is created alongside the post so readers can
          // see a placeholder as soon as the post exists. The thumbhash job
          // fills it in; an existing READY row for a reused cover is kept.
          if (fields.coverImage !== null) {
            yield* tx
              .insert(mediaImage)
              .values({
                id: fields.coverImage,
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
        postId,
        arweaveId: arweaveTxId,
      },
    });

    return { coverImage: fields.coverImage, postId };
  });

export const markDraftPublishFailed = (
  job: PublishDraftJob,
): Effect.Effect<void, never, Database | PostHogService> =>
  Effect.gen(function* () {
    const db = yield* Database;
    const posthog = yield* PostHogService;

    // Fenced by generation: a failed job replaced by a newer publish of the
    // draft must not mark the newer one as failed.
    const marked = yield* db
      .update(draft)
      .set({
        txStatus: "FAILED",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(draft.id, job.draftId),
          eq(draft.userId, job.userId),
          eq(draft.publishGeneration, job.generation),
        ),
      )
      .returning({ id: draft.id })
      .pipe(
        Effect.retry({
          schedule: Schedule.exponential("100 millis"),
          times: 3,
        }),
        Effect.catchCause((cause) =>
          Effect.logError(
            `Failed to mark draft ${job.draftId} as FAILED`,
            cause,
          ).pipe(Effect.as([])),
        ),
      );

    // Only the publish the draft still belongs to failed for the user: a newer
    // publish of the draft took over from an older job.
    if (marked.length > 0) {
      yield* posthog.capture({
        distinctId: job.userId,
        event: "draft_publish_failed",
        properties: { draftId: job.draftId },
      });
    }
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
