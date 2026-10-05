import { and, eq, lt } from "drizzle-orm";
import { Effect, Layer, Schedule } from "effect";
import { Database } from "@/db";
import { mediaImage } from "@/db/schema";
import { JobAdminService } from "@/queue/admin";
import {
  generateImageThumbhashJob,
  thumbhashJobId,
} from "./generate-image-thumbhash";

/**
 * A pending media row older than this with no queue row means the offer was
 * lost (e.g. crash between the publish transaction and the job offer).
 */
export const MEDIA_IMAGE_RECONCILE_STALE_MILLIS = 15 * 60 * 1000;

const RECONCILE_BATCH_SIZE = 50;

const RECONCILE_INTERVAL = "10 minutes";

export const reconcileMediaImages = Effect.gen(function* () {
  const db = yield* Database;
  const admin = yield* JobAdminService;

  const cutoff = new Date(Date.now() - MEDIA_IMAGE_RECONCILE_STALE_MILLIS);

  const staleRows = yield* db
    .select({ id: mediaImage.id })
    .from(mediaImage)
    .where(
      and(eq(mediaImage.status, "PENDING"), lt(mediaImage.updatedAt, cutoff)),
    )
    .limit(RECONCILE_BATCH_SIZE)
    .pipe(Effect.orDie);

  for (const row of staleRows) {
    const jobId = thumbhashJobId(row.id);

    const jobState = yield* admin.getJobState(
      generateImageThumbhashJob.name,
      jobId,
    );

    if (jobState === null) {
      yield* generateImageThumbhashJob
        .offer({ imageId: row.id }, { id: jobId })
        .pipe(Effect.orDie);

      yield* Effect.logInfo("Re-offered lost image thumbhash job", {
        imageId: row.id,
      });
    }
  }
});

export const MediaImageReconcileLive = Layer.effectDiscard(
  reconcileMediaImages.pipe(
    Effect.catchCause((cause) =>
      Effect.logWarning("Media image reconciliation failed", cause),
    ),
    Effect.repeat(Schedule.spaced(RECONCILE_INTERVAL)),
    Effect.interruptible,
    Effect.forkScoped,
  ),
).pipe(
  Layer.provideMerge(generateImageThumbhashJob.layer),
  Layer.provideMerge(JobAdminService.layer),
);
