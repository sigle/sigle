import { and, eq, isNull, lt } from "drizzle-orm";
import { Effect, Layer, Schedule } from "effect";
import { Database } from "@/db";
import { postOts } from "@/db/schema";
import { JobAdminService } from "@/queue/admin";
import { opentimestampsStampJob, otsStampJobId } from "./opentimestamps-stamp";

/**
 * A pending proof with no stored bytes is only legitimate while the stamp job
 * is being produced or retried. Past this age with no queue row, the offer was
 * lost (e.g. crash between the publish transaction and the job offer).
 */
export const OT_RECONCILE_STALE_MILLIS = 15 * 60 * 1000;

const RECONCILE_BATCH_SIZE = 50;

const RECONCILE_INTERVAL = "10 minutes";

export const reconcileOpenTimestamps = Effect.gen(function* () {
  const db = yield* Database;
  const admin = yield* JobAdminService;

  const cutoff = new Date(Date.now() - OT_RECONCILE_STALE_MILLIS);

  const staleRows = yield* db
    .select({ postId: postOts.postId })
    .from(postOts)
    .where(
      and(
        eq(postOts.status, "PENDING"),
        isNull(postOts.pendingProof),
        lt(postOts.updatedAt, cutoff),
      ),
    )
    .limit(RECONCILE_BATCH_SIZE)
    .pipe(Effect.orDie);

  for (const row of staleRows) {
    const jobId = otsStampJobId(row.postId);

    const jobState = yield* admin.getJobState(
      opentimestampsStampJob.name,
      jobId,
    );

    if (jobState === null) {
      yield* opentimestampsStampJob
        .offer({ postId: row.postId }, { id: jobId })
        .pipe(Effect.orDie);

      yield* Effect.logInfo("Re-offered lost OpenTimestamps stamp job", {
        postId: row.postId,
      });
    }
  }
});

export const OpenTimestampsReconcileLive = Layer.effectDiscard(
  reconcileOpenTimestamps.pipe(
    Effect.catchCause((cause) =>
      Effect.logWarning("OpenTimestamps reconciliation failed", cause),
    ),
    Effect.repeat(Schedule.spaced(RECONCILE_INTERVAL)),
    Effect.interruptible,
    Effect.forkScoped,
  ),
).pipe(
  Layer.provideMerge(opentimestampsStampJob.layer),
  Layer.provideMerge(JobAdminService.layer),
);
