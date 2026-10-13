import { eq, sql } from "drizzle-orm";
import { Effect, Layer, Option, Schema } from "effect";
import { Database } from "@/db";
import { draft, post, postRevision } from "@/db/schema";
import { generateImageThumbhashJob } from "@/jobs/generate-image-thumbhash";
import { defineJob } from "@/queue/core";
import { MediaImagesService } from "@/services/media-images";
import {
  type VerifiedPostMetadata,
  MetadataService,
} from "@/services/metadata";
import { UserProvisioningService } from "@/services/user-provisioning";

export const INDEX_POST_QUEUE_NAME = "index-post";

export const INDEX_POST_MAX_ATTEMPTS = 3;

export const IndexPostJobSchema = Schema.Struct({
  txId: Schema.String,
  rootTxId: Schema.optionalKey(Schema.String),
  blockHeight: Schema.Int,
  /** Block timestamp in seconds; falls back to the discovery time. */
  blockTimestamp: Schema.Int,
  uri: Schema.String,
});

export type IndexPostJob = typeof IndexPostJobSchema.Type;

export const indexPostJobId = (txId: string): string => `index-post:${txId}`;

const skipInvalidMetadata = (
  job: IndexPostJob,
  message: string,
): Effect.Effect<Option.Option<VerifiedPostMetadata>> =>
  Effect.logWarning("Skipping post with invalid metadata", {
    txId: job.txId,
    message,
  }).pipe(Effect.as(Option.none<VerifiedPostMetadata>()));

/**
 * Indexes a single Arweave metadata transaction discovered by the posts scan:
 * validates the signed metadata, attaches the transaction to its root post as
 * the latest revision, records the revision history, and schedules the cover
 * ThumbHash placeholder.
 *
 * Invalid or tampered metadata is skipped, not retried; transport failures are
 * retried by the queue.
 */
export const processIndexPostJob = (job: IndexPostJob) =>
  Effect.gen(function* () {
    const metadata = yield* MetadataService;
    const provisioning = yield* UserProvisioningService;
    const media = yield* MediaImagesService;
    const db = yield* Database;

    const verifiedOption = yield* metadata.getPostMetadataFromUri(job.uri).pipe(
      Effect.asSome,
      Effect.catchTags({
        InvalidMetadataError: (error) =>
          skipInvalidMetadata(job, error.message),
        MetadataSignatureError: (error) =>
          skipInvalidMetadata(job, error.message),
      }),
    );

    if (Option.isNone(verifiedOption)) {
      return;
    }

    const verified = verifiedOption.value;

    const [existingSignature] = yield* db
      .select({ id: post.id, arweaveTxId: post.arweaveTxId })
      .from(post)
      .where(eq(post.signature, verified.signature))
      .limit(1)
      .pipe(Effect.orDie);

    if (
      existingSignature !== undefined &&
      existingSignature.arweaveTxId !== job.txId
    ) {
      yield* Effect.logWarning("Skipping replayed post metadata", {
        txId: job.txId,
        existingTxId: existingSignature.arweaveTxId,
      });

      return;
    }

    const ensured = yield* provisioning.ensureUserByWalletAddress(
      verified.recoveredAddress,
    );

    const targetPostId = job.rootTxId ?? job.txId;
    const coverImage = verified.metadata.content.coverImage?.url ?? null;
    const createdAt = new Date(job.blockTimestamp * 1000);

    const outcome = yield* db
      .transaction((tx) =>
        Effect.gen(function* () {
          // A local publish may still be finalizing this transaction; the
          // publish worker owns the post in that case.
          const [pendingDraft] = yield* tx
            .select({ id: draft.id })
            .from(draft)
            .where(eq(draft.arweaveTxId, job.txId))
            .limit(1);

          if (pendingDraft !== undefined) {
            return "skipped" as const;
          }

          const [existing] = yield* tx
            .select({
              arweaveTxId: post.arweaveTxId,
              arweaveBlockHeight: post.arweaveBlockHeight,
              createdAt: post.createdAt,
            })
            .from(post)
            .where(eq(post.id, targetPostId))
            .limit(1);

          if (existing !== undefined) {
            const isNewTx = existing.arweaveTxId !== job.txId;

            // Never let an older mined transaction overwrite a newer revision.
            if (
              isNewTx &&
              job.blockHeight > 0 &&
              existing.arweaveBlockHeight !== null &&
              existing.arweaveBlockHeight > job.blockHeight
            ) {
              return "skipped" as const;
            }

            if (isNewTx) {
              yield* tx
                .insert(postRevision)
                .values({
                  id: crypto.randomUUID(),
                  postId: targetPostId,
                  txId: existing.arweaveTxId,
                  arweaveBlockHeight: existing.arweaveBlockHeight,
                  createdAt: existing.createdAt,
                })
                .onConflictDoNothing();

              yield* tx
                .update(post)
                .set({
                  arweaveTxId: job.txId,
                  arweaveBlockHeight: job.blockHeight,
                  version: verified.version,
                  metadataUri: job.uri,
                  title: verified.metadata.content.title,
                  content: verified.metadata.content.content,
                  metaTitle: verified.metaTitle ?? null,
                  metaDescription: verified.metaDescription ?? null,
                  excerpt: verified.excerpt,
                  coverImage,
                  tags: verified.metadata.content.tags ?? [],
                  canonicalUri: verified.canonicalUri ?? null,
                  signature: verified.signature,
                  revisionsCount: sql`${post.revisionsCount} + 1`,
                  updatedAt: new Date(),
                })
                .where(eq(post.id, targetPostId));
            }
          } else {
            yield* tx.insert(post).values({
              id: targetPostId,
              version: verified.version,
              arweaveTxId: job.txId,
              arweaveBlockHeight: job.blockHeight,
              metadataUri: job.uri,
              title: verified.metadata.content.title,
              content: verified.metadata.content.content,
              metaTitle: verified.metaTitle ?? null,
              metaDescription: verified.metaDescription ?? null,
              excerpt: verified.excerpt,
              coverImage,
              tags: verified.metadata.content.tags ?? [],
              canonicalUri: verified.canonicalUri ?? null,
              signature: verified.signature,
              createdAt,
              userId: ensured.userId,
            });
          }

          yield* tx
            .insert(postRevision)
            .values({
              id: crypto.randomUUID(),
              postId: targetPostId,
              txId: job.txId,
              arweaveBlockHeight: job.blockHeight,
              createdAt,
            })
            .onConflictDoNothing();

          return "indexed" as const;
        }),
      )
      .pipe(Effect.orDie);

    if (outcome === "skipped") {
      return;
    }

    if (coverImage !== null) {
      yield* media.ensurePlaceholder(coverImage);
    }

    yield* Effect.logInfo("post.indexed", {
      postId: targetPostId,
      txId: job.txId,
      author: verified.recoveredAddress,
    });
  });

export const indexPostJob = defineJob({
  name: INDEX_POST_QUEUE_NAME,
  payload: IndexPostJobSchema,
  maxAttempts: INDEX_POST_MAX_ATTEMPTS,
  concurrency: 1,
  process: (job) => processIndexPostJob(job),
  reportPayload: (job) => ({ txId: job.txId, rootTxId: job.rootTxId ?? "" }),
});

export const IndexPostWorkerLive = indexPostJob
  .workerLayer()
  .pipe(
    Layer.provideMerge(indexPostJob.layer),
    Layer.provideMerge(generateImageThumbhashJob.layer),
  );
