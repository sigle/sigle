import { eq } from "drizzle-orm";
import { Data, Effect, Layer, Schedule, Schema } from "effect";
import { Database } from "@/db";
import { post, postOts } from "@/db/schema";
import { defineJob, terminal, type TerminalJobError } from "@/queue/core";
import { ArweaveService, type ArweaveUploadError } from "@/services/arweave";
import {
  OpenTimestampsService,
  type OtsUpgradeFailure,
} from "@/services/opentimestamps";

export const OPENTIMESTAMPS_UPGRADE_QUEUE_NAME = "opentimestamps-upgrade";

export const OPENTIMESTAMPS_UPGRADE_MAX_ATTEMPTS = 97;

const upgradeRetrySchedule: Schedule.Schedule<unknown, number> =
  Schedule.jittered(
    // Bitcoin confirmations usually arrive within an hour, but can take
    // several hours under congestion. 97 attempts roughly cover 48 hours.
    Schedule.spaced("30 minutes"),
  );

export const OpenTimestampsUpgradeJobSchema = Schema.Struct({
  postId: Schema.String,
});

export type OpenTimestampsUpgradeJob =
  typeof OpenTimestampsUpgradeJobSchema.Type;

export class OtsPendingProofMissingError extends Data.TaggedError(
  "OtsPendingProofMissingError",
)<{
  readonly postId: string;
}> {}

export class OtsVerificationInvalidError extends Data.TaggedError(
  "OtsVerificationInvalidError",
)<{
  readonly postId: string;
  readonly reason: string;
}> {}

export const processOpenTimestampsUpgradeJob = (
  job: OpenTimestampsUpgradeJob,
): Effect.Effect<
  void,
  OtsUpgradeFailure | TerminalJobError | ArweaveUploadError,
  Database | OpenTimestampsService | ArweaveService
> =>
  Effect.gen(function* () {
    const db = yield* Database;
    const ots = yield* OpenTimestampsService;
    const arweave = yield* ArweaveService;

    const [foundPost] = yield* db
      .select({ id: post.id, arweaveTxId: post.arweaveTxId })
      .from(post)
      .where(eq(post.id, job.postId))
      .limit(1)
      .pipe(Effect.orDie);

    if (!foundPost) {
      return;
    }

    const [postOtsRow] = yield* db
      .select()
      .from(postOts)
      .where(eq(postOts.postId, job.postId))
      .limit(1)
      .pipe(Effect.orDie);

    if (!postOtsRow || postOtsRow.status === "UPGRADED") {
      return;
    }

    if (!postOtsRow.pendingProof) {
      return yield* terminal(
        new OtsPendingProofMissingError({ postId: job.postId }),
      );
    }

    // A malformed proof can never be upgraded: fail fast instead of burning
    // through the 48h retry window.
    const proof = yield* ots
      .upgrade(postOtsRow.pendingProof)
      .pipe(
        Effect.catchTag("OtsInvalidProofError", (error) =>
          Effect.fail(terminal(error)),
        ),
      );

    const verification = yield* ots.verify(proof, postOtsRow.contentHash);

    // An invalid verification means the digest does not match the proof or
    // the Bitcoin block. Never record that proof as anchored.
    if (verification.status === "invalid") {
      return yield* terminal(
        new OtsVerificationInvalidError({
          postId: job.postId,
          reason: verification.reason,
        }),
      );
    }

    const uploaded = yield* arweave.uploadFile({
      file: proof,
      contentType: "application/vnd.opentimestamps.ots",
      tags: [
        { name: "Original-Tx", value: foundPost.arweaveTxId },
        { name: "Root-TX", value: foundPost.arweaveTxId },
        { name: "Type", value: "opentimestamps" },
      ],
    });

    const verified = verification.status === "verified" ? verification : null;

    yield* db
      .update(postOts)
      .set({
        status: "UPGRADED",
        otsTxId: uploaded.id,
        pendingProof: null,
        bitcoinBlockHeight: verified?.blockHeight ?? null,
        bitcoinBlockHash: verified?.blockHash ?? null,
        bitcoinTimestamp:
          verified === null ? null : new Date(verified.blockTime * 1000),
        updatedAt: new Date(),
      })
      .where(eq(postOts.postId, job.postId))
      .pipe(Effect.orDie);

    yield* Effect.logInfo("OpenTimestamps proof upgraded", {
      postId: job.postId,
      otsTxId: uploaded.id,
      bitcoinBlockHeight: verified?.blockHeight ?? null,
    });
  });

/**
 * Marks the proof as failed so it stops being retried automatically. The
 * dead-lettered queue job can be re-queued through the admin API, which runs
 * this handler again.
 */
export const markOpenTimestampsFailed = (
  job: OpenTimestampsUpgradeJob,
): Effect.Effect<void, never, Database> =>
  Effect.gen(function* () {
    const db = yield* Database;

    yield* db
      .update(postOts)
      .set({ status: "FAILED", updatedAt: new Date() })
      .where(eq(postOts.postId, job.postId))
      .pipe(
        Effect.retry({
          schedule: Schedule.exponential("100 millis"),
          times: 3,
        }),
        Effect.catchCause((cause) =>
          Effect.logError(
            `Failed to mark post ${job.postId} OpenTimestamps proof as FAILED`,
            cause,
          ),
        ),
      );
  });

export const opentimestampsUpgradeJob = defineJob({
  name: OPENTIMESTAMPS_UPGRADE_QUEUE_NAME,
  payload: OpenTimestampsUpgradeJobSchema,
  maxAttempts: OPENTIMESTAMPS_UPGRADE_MAX_ATTEMPTS,
  retrySchedule: upgradeRetrySchedule,
  concurrency: 2,
  process: (job) => processOpenTimestampsUpgradeJob(job),
  onFinalFailure: (job) => markOpenTimestampsFailed(job),
  reportPayload: (job) => ({ postId: job.postId }),
});

export const OpenTimestampsUpgradeWorkerLive = opentimestampsUpgradeJob
  .workerLayer()
  .pipe(Layer.provideMerge(opentimestampsUpgradeJob.layer));
