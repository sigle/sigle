import { eq } from "drizzle-orm";
import { Data, Effect, Layer, Option, Schedule, Schema } from "effect";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { mediaImage } from "@/db/schema";
import {
  detectImageFormat,
  type ImageOptimizationError,
  mimeTypeForSharpFormat,
  resolveImageUrl,
} from "@/lib/images";
import { defineJob, terminal, type TerminalJobError } from "@/queue/core";
import {
  ImageProcessingService,
  type ImageProcessingTimeoutError,
} from "@/services/image-processing";

export const GENERATE_IMAGE_THUMBHASH_QUEUE_NAME = "generate-image-thumbhash";

export const GENERATE_IMAGE_THUMBHASH_MAX_ATTEMPTS = 3;

/**
 * Upper bound on the bytes downloaded for a single image. Remote images are
 * untrusted, so a huge body is treated as permanently invalid instead of being
 * retried.
 */
export const GENERATE_IMAGE_THUMBHASH_MAX_BYTES = 10 * 1024 * 1024;

const FETCH_TIMEOUT_MILLIS = 30_000;

export const GenerateImageThumbhashJobSchema = Schema.Struct({
  imageId: Schema.String,
});

export type GenerateImageThumbhashJob =
  typeof GenerateImageThumbhashJobSchema.Type;

export const thumbhashJobId = (imageId: string): string =>
  `thumbhash:${imageId}`;

export class ImageFetchError extends Data.TaggedError("ImageFetchError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

class InvalidImageError extends Data.TaggedError("InvalidImageError")<{
  readonly message: string;
}> {}

const describeCause = (cause: unknown): string =>
  cause instanceof Error ? cause.message : String(cause);

export const processGenerateImageThumbhashJob = (
  job: GenerateImageThumbhashJob,
): Effect.Effect<
  void,
  | ImageFetchError
  | ImageOptimizationError
  | ImageProcessingTimeoutError
  | TerminalJobError,
  Database | AppConfig | ImageProcessingService
> =>
  Effect.gen(function* () {
    const db = yield* Database;
    const config = yield* AppConfig;
    const images = yield* ImageProcessingService;

    // Producers insert the row alongside the post/profile, but the job also
    // accepts bare offers by creating the row itself.
    yield* db
      .insert(mediaImage)
      .values({ id: job.imageId })
      .onConflictDoNothing()
      .pipe(Effect.orDie);

    const [row] = yield* db
      .select({
        status: mediaImage.status,
        thumbhash: mediaImage.thumbhash,
        mimeType: mediaImage.mimeType,
      })
      .from(mediaImage)
      .where(eq(mediaImage.id, job.imageId))
      .limit(1)
      .pipe(Effect.orDie);

    // Redeliveries and re-offers of an already processed image are no-ops.
    if (
      row === undefined ||
      (row.status === "READY" && row.thumbhash !== null)
    ) {
      return;
    }

    const url = resolveImageUrl(job.imageId, {
      arweave: config.ARWEAVE_GATEWAY_URL,
      ipfs: config.IPFS_GATEWAY_URL,
    });

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(url, {
          redirect: "follow",
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MILLIS),
        }),
      catch: (cause) =>
        new ImageFetchError({
          cause,
          message: `Failed to fetch image: ${describeCause(cause)}`,
        }),
    });

    // A missing image will never appear, so stop retrying it.
    if (response.status === 404 || response.status === 410) {
      return yield* terminal(
        new InvalidImageError({
          message: `Image not found: HTTP ${response.status}`,
        }),
      );
    }

    if (!response.ok) {
      return yield* new ImageFetchError({
        cause: response,
        message: `Failed to fetch image: HTTP ${response.status}`,
      });
    }

    const declaredSize = Number(response.headers.get("content-length") ?? "");

    if (
      Number.isFinite(declaredSize) &&
      declaredSize > GENERATE_IMAGE_THUMBHASH_MAX_BYTES
    ) {
      return yield* terminal(
        new InvalidImageError({
          message: `Image is too large: ${declaredSize} bytes`,
        }),
      );
    }

    const body = yield* Effect.tryPromise({
      try: () => response.arrayBuffer(),
      catch: (cause) =>
        new ImageFetchError({
          cause,
          message: `Failed to read image body: ${describeCause(cause)}`,
        }),
    });

    if (body.byteLength > GENERATE_IMAGE_THUMBHASH_MAX_BYTES) {
      return yield* terminal(
        new InvalidImageError({
          message: `Image is too large: ${body.byteLength} bytes`,
        }),
      );
    }

    const buffer = new Uint8Array(body);

    const detected = yield* detectImageFormat(buffer).pipe(
      Effect.orElseSucceed(() => Option.none()),
    );

    if (Option.isNone(detected)) {
      return yield* terminal(
        new InvalidImageError({ message: "Image format not supported" }),
      );
    }

    const mimeType =
      mimeTypeForSharpFormat(detected.value) ??
      (detected.value === "gif" ? "image/gif" : null);

    const thumbhash = yield* images.generateThumbhash(buffer);

    yield* db
      .update(mediaImage)
      .set({
        height: thumbhash.height,
        mimeType: mimeType ?? row.mimeType,
        size: body.byteLength,
        status: "READY",
        thumbhash: thumbhash.thumbhash,
        updatedAt: new Date(),
        width: thumbhash.width,
      })
      .where(eq(mediaImage.id, job.imageId))
      .pipe(Effect.orDie);
  });

export const markImageThumbhashFailed = (
  job: GenerateImageThumbhashJob,
): Effect.Effect<void, never, Database> =>
  Effect.gen(function* () {
    const db = yield* Database;

    yield* db
      .update(mediaImage)
      .set({ status: "FAILED", updatedAt: new Date() })
      .where(eq(mediaImage.id, job.imageId))
      .pipe(
        Effect.retry({
          schedule: Schedule.exponential("100 millis"),
          times: 3,
        }),
        Effect.catchCause((cause) =>
          Effect.logError(
            `Failed to mark image ${job.imageId} thumbhash as FAILED`,
            cause,
          ),
        ),
      );
  });

export const generateImageThumbhashJob = defineJob({
  name: GENERATE_IMAGE_THUMBHASH_QUEUE_NAME,
  payload: GenerateImageThumbhashJobSchema,
  maxAttempts: GENERATE_IMAGE_THUMBHASH_MAX_ATTEMPTS,
  concurrency: 2,
  process: (job) => processGenerateImageThumbhashJob(job),
  onFinalFailure: (job) => markImageThumbhashFailed(job),
  reportPayload: (job) => ({ imageId: job.imageId }),
});

export const GenerateImageThumbhashWorkerLive = generateImageThumbhashJob
  .workerLayer()
  .pipe(Layer.provideMerge(generateImageThumbhashJob.layer));
