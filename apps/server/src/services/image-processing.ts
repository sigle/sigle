import { Context, Data, Duration, Effect, Layer, Semaphore } from "effect";
import type {
  ImageOptimizationError,
  ImageTooLargeError,
  OptimizeImageOptions,
  OptimizedImage,
  ThumbhashResult,
} from "@/lib/images";
import {
  generateThumbhash,
  IMAGE_PROCESSING_TIMEOUT_SECONDS,
  optimizeImage,
} from "@/lib/images";

export const MAX_CONCURRENT_OPTIMIZATIONS = 2;

/**
 * How long an image waits for a processing permit before the server answers
 * that it is busy. The slowest images the upload limits allow took about a
 * second to process when measured, so a wait this long means the queue is
 * full.
 */
export const IMAGE_PROCESSING_QUEUE_TIMEOUT = Duration.seconds(5);

const OPTIMIZATION_TIMEOUT = Duration.seconds(IMAGE_PROCESSING_TIMEOUT_SECONDS);

export class ImageProcessingTimeoutError extends Data.TaggedError(
  "ImageProcessingTimeoutError",
)<{
  readonly timeoutMillis: number;
}> {}

/** No processing permit freed up within `IMAGE_PROCESSING_QUEUE_TIMEOUT`. */
export class ImageProcessingBusyError extends Data.TaggedError(
  "ImageProcessingBusyError",
)<{
  readonly retryAfterMillis: number;
}> {}

export interface ImageProcessor {
  readonly optimize: (
    options: OptimizeImageOptions,
  ) => Effect.Effect<
    OptimizedImage,
    | ImageOptimizationError
    | ImageProcessingBusyError
    | ImageProcessingTimeoutError
    | ImageTooLargeError
  >;
  readonly generateThumbhash: (
    buffer: Uint8Array,
  ) => Effect.Effect<
    ThumbhashResult,
    | ImageOptimizationError
    | ImageProcessingBusyError
    | ImageProcessingTimeoutError
  >;
}

/**
 * Runs effects at most `MAX_CONCURRENT_OPTIMIZATIONS` at a time.
 *
 * The wait for a permit and the processing have separate deadlines, so an
 * image queued behind slow ones fails fast as busy instead of timing out, and
 * its own processing time is measured from when it gets the permit.
 *
 * The processing is uninterruptible: interrupting it would not stop libvips,
 * and releasing the permit early would let more images than the limit be
 * processed at once.
 */
export const makeImageProcessingQueue = Effect.gen(function* () {
  const semaphore = yield* Semaphore.make(MAX_CONCURRENT_OPTIMIZATIONS);

  return <A, E>(
    effect: Effect.Effect<A, E>,
  ): Effect.Effect<
    A,
    E | ImageProcessingBusyError | ImageProcessingTimeoutError
  > =>
    Effect.scoped(
      Effect.gen(function* () {
        yield* semaphore.takeScoped(1).pipe(
          Effect.timeoutOrElse({
            duration: IMAGE_PROCESSING_QUEUE_TIMEOUT,
            orElse: () =>
              Effect.fail(
                new ImageProcessingBusyError({
                  retryAfterMillis: Duration.toMillis(
                    IMAGE_PROCESSING_QUEUE_TIMEOUT,
                  ),
                }),
              ),
          }),
        );

        return yield* effect.pipe(
          Effect.uninterruptible,
          Effect.timeoutOrElse({
            duration: OPTIMIZATION_TIMEOUT,
            orElse: () =>
              Effect.fail(
                new ImageProcessingTimeoutError({
                  timeoutMillis: Duration.toMillis(OPTIMIZATION_TIMEOUT),
                }),
              ),
          }),
        );
      }),
    );
});

/**
 * Runs sharp behind a queue so large covers cannot exhaust the CPU, and gives
 * up on an image that takes too long to process.
 */
export class ImageProcessingService extends Context.Service<
  ImageProcessingService,
  ImageProcessor
>()("sigle/ImageProcessingService") {
  static readonly layer: Layer.Layer<ImageProcessingService> = Layer.effect(
    ImageProcessingService,
    Effect.gen(function* () {
      const runInQueue = yield* makeImageProcessingQueue;

      return {
        optimize: (options) => runInQueue(optimizeImage(options)),
        generateThumbhash: (buffer) =>
          runInQueue(generateThumbhash({ buffer })),
      } satisfies ImageProcessor;
    }),
  );
}
