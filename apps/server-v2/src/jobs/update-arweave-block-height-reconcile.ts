import { and, isNull, lt } from "drizzle-orm";
import { Effect, Layer, Schedule } from "effect";
import { Database } from "@/db";
import { post } from "@/db/schema";
import { JobAdminService } from "@/queue/admin";
import {
  blockHeightJobId,
  updateArweaveBlockHeightJob,
} from "./update-arweave-block-height";

/**
 * A published post older than this with no queue row means the offer was lost
 * (e.g. crash between the publish transaction and the job offer).
 */
export const BLOCK_HEIGHT_RECONCILE_STALE_MILLIS = 15 * 60 * 1000;

const RECONCILE_BATCH_SIZE = 50;

const RECONCILE_INTERVAL = "10 minutes";

export const reconcilePostBlockHeights = Effect.gen(function* () {
  const db = yield* Database;
  const admin = yield* JobAdminService;

  const cutoff = new Date(Date.now() - BLOCK_HEIGHT_RECONCILE_STALE_MILLIS);

  const lostPostIds: Array<string> = [];
  let offset = 0;

  // Scan until the recovery batch is filled or the stale rows are exhausted,
  // so rows that already have a queue job do not consume batch slots.
  while (lostPostIds.length < RECONCILE_BATCH_SIZE) {
    const staleRows = yield* db
      .select({ id: post.id })
      .from(post)
      .where(and(isNull(post.arweaveBlockHeight), lt(post.createdAt, cutoff)))
      .orderBy(post.createdAt, post.id)
      .limit(RECONCILE_BATCH_SIZE)
      .offset(offset)
      .pipe(Effect.orDie);

    if (staleRows.length === 0) {
      break;
    }

    offset += staleRows.length;

    for (const row of staleRows) {
      const jobState = yield* admin.getJobState(
        updateArweaveBlockHeightJob.name,
        blockHeightJobId(row.id),
      );

      if (jobState === null) {
        lostPostIds.push(row.id);

        if (lostPostIds.length === RECONCILE_BATCH_SIZE) {
          break;
        }
      }
    }
  }

  for (const postId of lostPostIds) {
    yield* updateArweaveBlockHeightJob
      .offer({ postId }, { id: blockHeightJobId(postId) })
      .pipe(Effect.orDie);

    yield* Effect.logInfo("Re-offered lost post block height job", { postId });
  }
});

export const UpdateArweaveBlockHeightReconcileLive = Layer.effectDiscard(
  reconcilePostBlockHeights.pipe(
    Effect.catchCause((cause) =>
      Effect.logWarning("Post block height reconciliation failed", cause),
    ),
    Effect.repeat(Schedule.spaced(RECONCILE_INTERVAL)),
    Effect.interruptible,
    Effect.forkScoped,
  ),
).pipe(
  Layer.provideMerge(updateArweaveBlockHeightJob.layer),
  Layer.provideMerge(JobAdminService.layer),
);
