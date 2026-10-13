import { eq } from "drizzle-orm";
import { Effect, Layer, Option, Schema } from "effect";
import { Database } from "@/db";
import { profile } from "@/db/schema";
import { generateImageThumbhashJob } from "@/jobs/generate-image-thumbhash";
import { defineJob } from "@/queue/core";
import { MediaImagesService } from "@/services/media-images";
import {
  MetadataService,
  type VerifiedProfileMetadata,
} from "@/services/metadata";
import { UserProvisioningService } from "@/services/user-provisioning";

export const INDEX_PROFILE_QUEUE_NAME = "index-profile";

export const INDEX_PROFILE_MAX_ATTEMPTS = 3;

export const IndexProfileJobSchema = Schema.Struct({
  txId: Schema.String,
  blockHeight: Schema.Int,
  /** Block timestamp in seconds; falls back to the discovery time. */
  blockTimestamp: Schema.Int,
  uri: Schema.String,
});

export type IndexProfileJob = typeof IndexProfileJobSchema.Type;

export const indexProfileJobId = (txId: string): string =>
  `index-profile:${txId}`;

const skipInvalidMetadata = (
  job: IndexProfileJob,
  message: string,
): Effect.Effect<Option.Option<VerifiedProfileMetadata>> =>
  Effect.logWarning("Skipping profile with invalid metadata", {
    txId: job.txId,
    message,
  }).pipe(Effect.as(Option.none<VerifiedProfileMetadata>()));

/**
 * Indexes a single signed profile metadata transaction discovered by the
 * profiles scan: verifies the signature, provisions the signing wallet, and
 * upserts the profile for its owner. Replayed signatures and older mined
 * transactions are skipped; transport failures are retried by the queue.
 */
export const processIndexProfileJob = (job: IndexProfileJob) =>
  Effect.gen(function* () {
    const metadata = yield* MetadataService;
    const provisioning = yield* UserProvisioningService;
    const media = yield* MediaImagesService;
    const db = yield* Database;

    const verifiedOption = yield* metadata
      .getProfileMetadataFromUri(job.uri)
      .pipe(
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
      .select({ userId: profile.userId, arweaveTxId: profile.arweaveTxId })
      .from(profile)
      .where(eq(profile.signature, verified.signature))
      .limit(1)
      .pipe(Effect.orDie);

    if (
      existingSignature !== undefined &&
      existingSignature.arweaveTxId !== job.txId
    ) {
      yield* Effect.logWarning("Skipping replayed profile metadata", {
        txId: job.txId,
        existingTxId: existingSignature.arweaveTxId,
      });

      return;
    }

    const ensured = yield* provisioning.ensureUserByWalletAddress(
      verified.recoveredAddress,
    );

    const { content } = verified.metadata;
    const createdAt = new Date(job.blockTimestamp * 1000);

    const fields = {
      walletAddressId: ensured.walletAddressId,
      arweaveTxId: job.txId,
      signature: verified.signature,
      arweaveBlockHeight: job.blockHeight,
      displayName: content.displayName ?? null,
      description: content.description ?? null,
      website: content.website ?? null,
      twitter: content.twitter ?? null,
      picture: content.picture ?? null,
      coverPicture: content.coverPicture ?? null,
      updatedAt: new Date(),
    };

    const outcome = yield* db
      .transaction((tx) =>
        Effect.gen(function* () {
          const [existing] = yield* tx
            .select({ arweaveBlockHeight: profile.arweaveBlockHeight })
            .from(profile)
            .where(eq(profile.userId, ensured.userId))
            .limit(1);

          // Never let an older mined transaction overwrite a newer profile.
          if (
            existing !== undefined &&
            job.blockHeight > 0 &&
            existing.arweaveBlockHeight !== null &&
            existing.arweaveBlockHeight > job.blockHeight
          ) {
            return "skipped" as const;
          }

          yield* tx
            .insert(profile)
            .values({
              userId: ensured.userId,
              ...fields,
              createdAt,
            })
            .onConflictDoUpdate({
              target: profile.userId,
              set: fields,
            });

          return "indexed" as const;
        }),
      )
      .pipe(Effect.orDie);

    if (outcome === "skipped") {
      return;
    }

    if (content.picture !== undefined) {
      yield* media.ensurePlaceholder(content.picture);
    }

    if (content.coverPicture !== undefined) {
      yield* media.ensurePlaceholder(content.coverPicture);
    }

    yield* Effect.logInfo("profile.indexed", {
      userId: ensured.userId,
      txId: job.txId,
      address: verified.recoveredAddress,
    });
  });

export const indexProfileJob = defineJob({
  name: INDEX_PROFILE_QUEUE_NAME,
  payload: IndexProfileJobSchema,
  maxAttempts: INDEX_PROFILE_MAX_ATTEMPTS,
  concurrency: 1,
  process: (job) => processIndexProfileJob(job),
  reportPayload: (job) => ({ txId: job.txId }),
});

export const IndexProfileWorkerLive = indexProfileJob
  .workerLayer()
  .pipe(
    Layer.provideMerge(indexProfileJob.layer),
    Layer.provideMerge(generateImageThumbhashJob.layer),
  );
