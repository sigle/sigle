import { verifyMetadataSignature } from "@sigle/sdk";
import { and, eq, isNotNull, lt } from "drizzle-orm";
import { Data, Effect, Layer, Schema } from "effect";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { profile } from "@/db/schema";
import { ProfileMetadata } from "@/lib/metadata";
import { defineJob, terminal } from "@/queue/core";
import { ArweaveService } from "@/services/arweave";
import {
  generateImageThumbhashJob,
  scheduleImageThumbhash,
} from "./generate-image-thumbhash";

export const INDEX_PROFILE_QUEUE_NAME = "index-profile";

// The gateway can lag behind the GraphQL index when serving the data of a
// freshly bundled transaction, so give it a few retries.
export const INDEX_PROFILE_MAX_ATTEMPTS = 5;

export const IndexProfileJobSchema = Schema.Struct({
  txId: Schema.String,
  blockHeight: Schema.Int,
});

export type IndexProfileJob = typeof IndexProfileJobSchema.Type;

export const indexProfileJobId = (txId: string): string =>
  `index-profile:${txId}`;

class InvalidProfileTransactionError extends Data.TaggedError(
  "InvalidProfileTransactionError",
)<{
  readonly txId: string;
  readonly message: string;
}> {}

const decodeProfileMetadataJson = Schema.decodeUnknownEffect(
  Schema.fromJsonString(ProfileMetadata),
);

interface ProfilePictures {
  readonly picture: string | null;
  readonly coverPicture: string | null;
}

/**
 * Externally hosted pictures bypass the image upload endpoint, so every
 * profile write schedules the placeholder of the pictures it changes.
 */
export const scheduleChangedProfileImages = (
  previous: ProfilePictures | undefined,
  next: ProfilePictures,
) => {
  const changed = new Set<string>();

  if (next.picture !== null && next.picture !== previous?.picture) {
    changed.add(next.picture);
  }

  if (
    next.coverPicture !== null &&
    next.coverPicture !== previous?.coverPicture
  ) {
    changed.add(next.coverPicture);
  }

  return Effect.forEach(changed, scheduleImageThumbhash, { discard: true });
};

/**
 * - `confirmed`: the stored profile is this transaction, its block was set.
 * - `indexed`: the transaction replaced the stored profile or created it.
 * - `replayed`: its signature is already stored under another transaction.
 * - `superseded`: the stored profile wins (see `processIndexProfileJob`).
 */
export type IndexProfileOutcome =
  | "confirmed"
  | "indexed"
  | "replayed"
  | "superseded";

/**
 * Stores the profile published in a mined Arweave transaction. The stored
 * profile is kept when it is not mined yet, since an upload through the API
 * is the latest action of its signer, or when it is mined at the same or a
 * higher block.
 */
export const processIndexProfileJob = (job: IndexProfileJob) =>
  Effect.gen(function* () {
    const db = yield* Database;
    const config = yield* AppConfig;
    const arweave = yield* ArweaveService;

    const confirmed = yield* db
      .update(profile)
      .set({ arweaveBlockHeight: job.blockHeight })
      .where(eq(profile.arweaveTxId, job.txId))
      .returning({ address: profile.address })
      .pipe(Effect.orDie);

    if (confirmed.length > 0) {
      return "confirmed" satisfies IndexProfileOutcome;
    }

    const raw = yield* arweave.getData(job.txId);

    const metadata = yield* decodeProfileMetadataJson(raw).pipe(
      Effect.mapError(() =>
        terminal(
          new InvalidProfileTransactionError({
            txId: job.txId,
            message: "Invalid profile metadata",
          }),
        ),
      ),
    );

    const verified = verifyMetadataSignature(metadata, {
      network: config.STACKS_ENV === "mainnet" ? "mainnet" : "testnet",
    });

    if (verified.isErr()) {
      return yield* terminal(
        new InvalidProfileTransactionError({
          txId: job.txId,
          message: verified.error.error,
        }),
      );
    }

    const { recoveredAddress, signature } = verified.value;

    const [signatureOwner] = yield* db
      .select({ arweaveTxId: profile.arweaveTxId })
      .from(profile)
      .where(eq(profile.signature, signature))
      .limit(1)
      .pipe(Effect.orDie);

    if (signatureOwner !== undefined) {
      yield* Effect.logWarning("Skipping replayed profile metadata", {
        txId: job.txId,
        storedTxId: signatureOwner.arweaveTxId,
      });

      return "replayed" satisfies IndexProfileOutcome;
    }

    const [existing] = yield* db
      .select({
        picture: profile.picture,
        coverPicture: profile.coverPicture,
      })
      .from(profile)
      .where(eq(profile.address, recoveredAddress))
      .limit(1)
      .pipe(Effect.orDie);

    const now = new Date();
    const { content } = metadata;

    const profileFields = {
      arweaveTxId: job.txId,
      arweaveBlockHeight: job.blockHeight,
      signature,
      displayName: content.displayName ?? null,
      description: content.description ?? null,
      website: content.website ?? null,
      twitter: content.twitter ?? null,
      picture: content.picture ?? null,
      coverPicture: content.coverPicture ?? null,
      updatedAt: now,
    };

    const written = yield* db
      .insert(profile)
      .values({ ...profileFields, address: recoveredAddress, createdAt: now })
      .onConflictDoUpdate({
        target: profile.address,
        set: profileFields,
        setWhere: and(
          isNotNull(profile.arweaveBlockHeight),
          lt(profile.arweaveBlockHeight, job.blockHeight),
        ),
      })
      .returning({ address: profile.address })
      .pipe(Effect.orDie);

    if (written.length === 0) {
      yield* Effect.logInfo("Keeping the stored profile", {
        txId: job.txId,
        address: recoveredAddress,
        blockHeight: job.blockHeight,
      });

      return "superseded" satisfies IndexProfileOutcome;
    }

    yield* scheduleChangedProfileImages(existing, profileFields);

    yield* Effect.logInfo("Indexed profile", {
      txId: job.txId,
      address: recoveredAddress,
      blockHeight: job.blockHeight,
    });

    return "indexed" satisfies IndexProfileOutcome;
  });

export const indexProfileJob = defineJob({
  name: INDEX_PROFILE_QUEUE_NAME,
  payload: IndexProfileJobSchema,
  maxAttempts: INDEX_PROFILE_MAX_ATTEMPTS,
  process: (job) => Effect.asVoid(processIndexProfileJob(job)),
  reportPayload: (job) => ({ txId: job.txId, blockHeight: job.blockHeight }),
});

export const IndexProfileWorkerLive = indexProfileJob
  .workerLayer()
  .pipe(
    Layer.provideMerge(indexProfileJob.layer),
    Layer.provideMerge(generateImageThumbhashJob.layer),
  );
