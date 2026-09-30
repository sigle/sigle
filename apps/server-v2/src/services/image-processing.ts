import { Context, Data, Duration, Effect, Layer, Semaphore } from "effect";
import {
  IMAGE_PROCESSING_TIMEOUT_SECONDS,
  ImageOptimizationError,
  optimizeImage,
  type OptimizeImageOptions,
  type OptimizedImage,
} from "@/lib/images";

const MAX_CONCURRENT_OPTIMIZATIONS = 2;

const OPTIMIZATION_TIMEOUT = Duration.seconds(IMAGE_PROCESSING_TIMEOUT_SECONDS);

export class ImageProcessingTimeoutError extends Data.TaggedError(
  "ImageProcessingTimeoutError",
)<{
  readonly timeoutMillis: number;
}> {}

export interface ImageProcessor {
  readonly optimize: (
    options: OptimizeImageOptions,
  ) => Effect.Effect<
    OptimizedImage,
    ImageOptimizationError | ImageProcessingTimeoutError
  >;
}

/**
 * Runs sharp behind a semaphore so large covers cannot exhaust the CPU, and
 * gives up on an image that takes too long to process.
 */
export class ImageProcessingService extends Context.Service<
  ImageProcessingService,
  ImageProcessor
>()("sigle/ImageProcessingService") {
  static readonly layer: Layer.Layer<ImageProcessingService> = Layer.effect(
    ImageProcessingService,
    Effect.gen(function* () {
      const semaphore = yield* Semaphore.make(MAX_CONCURRENT_OPTIMIZATIONS);

      return {
        optimize: (options) =>
          semaphore
            .withPermits(1)(optimizeImage(options).pipe(Effect.uninterruptible))
            .pipe(
              Effect.timeoutOrElse({
                duration: OPTIMIZATION_TIMEOUT,
                orElse: () =>
                  Effect.fail(
                    new ImageProcessingTimeoutError({
                      timeoutMillis: Duration.toMillis(OPTIMIZATION_TIMEOUT),
                    }),
                  ),
              }),
            ),
      } satisfies ImageProcessor;
    }),
  );
}
