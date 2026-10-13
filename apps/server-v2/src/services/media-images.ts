import { eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import type { JobQueue } from "@/queue/core";
import { Database } from "@/db";
import { mediaImage } from "@/db/schema";
import {
  GenerateImageThumbhashJobSchema,
  generateImageThumbhashJob,
  thumbhashJobId,
} from "@/jobs/generate-image-thumbhash";

type ThumbhashQueue = JobQueue<typeof GenerateImageThumbhashJobSchema>;

/**
 * `ensurePlaceholder` intentionally requires the ThumbHash job queue at call
 * time so discovery jobs can provide it from their own worker layer.
 */
export interface MediaImagesOperations {
  /**
   * Ensures the media row for an image URL exists and has a ThumbHash
   * placeholder scheduled. Images already READY with a thumbhash are left
   * untouched, and the stable job id makes repeated calls idempotent.
   */
  readonly ensurePlaceholder: (
    imageId: string,
  ) => Effect.Effect<void, never, ThumbhashQueue>;
}

export const makeMediaImagesService = Effect.gen(function* () {
  const db = yield* Database;

  return {
    ensurePlaceholder: (imageId) =>
      Effect.gen(function* () {
        const [existing] = yield* db
          .select({
            status: mediaImage.status,
            thumbhash: mediaImage.thumbhash,
          })
          .from(mediaImage)
          .where(eq(mediaImage.id, imageId))
          .limit(1);

        const hasPlaceholder =
          existing?.status === "READY" && existing.thumbhash !== null;

        if (hasPlaceholder) {
          return;
        }

        yield* db
          .insert(mediaImage)
          .values({ id: imageId })
          .onConflictDoNothing();

        yield* generateImageThumbhashJob.offer(
          { imageId },
          { id: thumbhashJobId(imageId) },
        );
      }).pipe(Effect.orDie),
  } satisfies MediaImagesOperations;
});

export class MediaImagesService extends Context.Service<
  MediaImagesService,
  MediaImagesOperations
>()("sigle/MediaImagesService") {
  static readonly layer: Layer.Layer<MediaImagesService, never, Database> =
    Layer.effect(MediaImagesService, makeMediaImagesService);
}
