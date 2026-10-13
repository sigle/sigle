import { eq } from "drizzle-orm";
import { Data, Effect, Layer, Option, Schedule, Schema } from "effect";
import { Database } from "@/db";
import { post } from "@/db/schema";
import { defineJob } from "@/queue/core";
import { ArweaveGraphQLService } from "@/services/arweave-graphql";

export const UPDATE_ARWEAVE_BLOCK_HEIGHT_QUEUE_NAME =
  "update-arweave-block-height";

export const UPDATE_ARWEAVE_BLOCK_HEIGHT_MAX_ATTEMPTS = 97;

const blockHeightRetrySchedule: Schedule.Schedule<unknown, number> =
  Schedule.jittered(
    // Bundling usually lands within minutes, but can take hours under
    // congestion. 97 attempts roughly cover 48 hours.
    Schedule.spaced("30 minutes"),
  );

export const UpdateArweaveBlockHeightJobSchema = Schema.Struct({
  postId: Schema.String,
});

export type UpdateArweaveBlockHeightJob =
  typeof UpdateArweaveBlockHeightJobSchema.Type;

export const blockHeightJobId = (postId: string): string =>
  `update-arweave-block-height:${postId}`;

export class ArweaveBlockPendingError extends Data.TaggedError(
  "ArweaveBlockPendingError",
)<{
  readonly postId: string;
  readonly txId: string;
}> {}

/**
 * Fills the Arweave block height of a published post once its transaction is
 * mined. Not being mined yet is a retryable condition; posts published before
 * this job runs are recovered by the reconciliation fiber.
 */
export const processUpdateArweaveBlockHeightJob = (
  job: UpdateArweaveBlockHeightJob,
) =>
  Effect.gen(function* () {
    const graphql = yield* ArweaveGraphQLService;
    const db = yield* Database;

    const [found] = yield* db
      .select({
        id: post.id,
        arweaveTxId: post.arweaveTxId,
        arweaveBlockHeight: post.arweaveBlockHeight,
      })
      .from(post)
      .where(eq(post.id, job.postId))
      .limit(1)
      .pipe(Effect.orDie);

    if (found === undefined) {
      yield* Effect.logWarning("Post not found for block height update", {
        postId: job.postId,
      });

      return;
    }

    if (found.arweaveBlockHeight !== null) {
      return;
    }

    const block = yield* graphql.fetchTransactionBlock(found.arweaveTxId);

    if (Option.isNone(block)) {
      return yield* new ArweaveBlockPendingError({
        postId: job.postId,
        txId: found.arweaveTxId,
      });
    }

    yield* db
      .update(post)
      .set({
        arweaveBlockHeight: block.value.height,
        updatedAt: new Date(),
      })
      .where(eq(post.id, job.postId))
      .pipe(Effect.orDie);

    yield* Effect.logInfo("post block height updated", {
      postId: job.postId,
      blockHeight: block.value.height,
    });
  });

export const updateArweaveBlockHeightJob = defineJob({
  name: UPDATE_ARWEAVE_BLOCK_HEIGHT_QUEUE_NAME,
  payload: UpdateArweaveBlockHeightJobSchema,
  maxAttempts: UPDATE_ARWEAVE_BLOCK_HEIGHT_MAX_ATTEMPTS,
  retrySchedule: blockHeightRetrySchedule,
  concurrency: 2,
  process: (job) => processUpdateArweaveBlockHeightJob(job),
  reportPayload: (job) => ({ postId: job.postId }),
});

export const UpdateArweaveBlockHeightWorkerLive = updateArweaveBlockHeightJob
  .workerLayer()
  .pipe(Layer.provideMerge(updateArweaveBlockHeightJob.layer));
