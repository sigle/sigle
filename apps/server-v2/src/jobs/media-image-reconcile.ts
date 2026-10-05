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

  const lostImageIds: Array<string> = [];
  let offset = 0;

  // Scan until the recovery batch is filled or the stale rows are exhausted,
  // so rows that already have a queue job do not consume batch slots.
  while (lostImageIds.length < RECONCILE_BATCH_SIZE) {
    const staleRows = yield* db
      .select({ id: mediaImage.id })
      .from(mediaImage)
      .where(
        and(eq(mediaImage.status, "PENDING"), lt(mediaImage.updatedAt, cutoff)),
      )
      .orderBy(mediaImage.updatedAt, mediaImage.id)
      .limit(RECONCILE_BATCH_SIZE)
      .offset(offset)
      .pipe(Effect.orDie);

    if (staleRows.length === 0) {
      break;
    }

    offset += staleRows.length;

    for (const row of staleRows) {
      const jobState = yield* admin.getJobState(
        generateImageThumbhashJob.name,
        thumbhashJobId(row.id),
      );

      if (jobState === null) {
        lostImageIds.push(row.id);

        if (lostImageIds.length === RECONCILE_BATCH_SIZE) {
          break;
        }
      }
    }
  }

  for (const imageId of lostImageIds) {
    yield* generateImageThumbhashJob
      .offer({ imageId }, { id: thumbhashJobId(imageId) })
      .pipe(Effect.orDie);

    yield* Effect.logInfo("Re-offered lost image thumbhash job", { imageId });
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
