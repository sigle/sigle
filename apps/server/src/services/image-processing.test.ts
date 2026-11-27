import { describe, expect, it } from "@effect/vitest";
import { Deferred, Duration, Effect, Fiber } from "effect";
import { TestClock } from "effect/testing";
import { IMAGE_PROCESSING_TIMEOUT_SECONDS } from "@/lib/images";
import {
  IMAGE_PROCESSING_QUEUE_TIMEOUT,
  ImageProcessingBusyError,
  makeImageProcessingQueue,
  MAX_CONCURRENT_OPTIMIZATIONS,
} from "@/services/image-processing";

const permitHolders = Array.from({ length: MAX_CONCURRENT_OPTIMIZATIONS });

describe("image processing queue", () => {
  it.effect("fails an image as busy when no permit frees up in time", () =>
    Effect.gen(function* () {
      const runInQueue = yield* makeImageProcessingQueue;
      const release = yield* Deferred.make<void>();

      yield* Effect.forEach(permitHolders, () =>
        Effect.forkChild(runInQueue(Deferred.await(release))),
      );

      const queued = yield* Effect.forkChild(
        runInQueue(Effect.succeed("processed")).pipe(Effect.flip),
      );

      yield* TestClock.adjust(IMAGE_PROCESSING_QUEUE_TIMEOUT);

      expect(yield* Fiber.join(queued)).toStrictEqual(
        new ImageProcessingBusyError({
          retryAfterMillis: Duration.toMillis(IMAGE_PROCESSING_QUEUE_TIMEOUT),
        }),
      );

      yield* Deferred.succeed(release, undefined);
    }),
  );

  it.effect("times the processing from when the image gets a permit", () =>
    Effect.gen(function* () {
      const runInQueue = yield* makeImageProcessingQueue;
      const waitForPermit = Duration.subtract(
        IMAGE_PROCESSING_QUEUE_TIMEOUT,
        Duration.seconds(1),
      );

      const processing = Duration.seconds(IMAGE_PROCESSING_TIMEOUT_SECONDS - 1);

      yield* Effect.forEach(permitHolders, () =>
        Effect.forkChild(runInQueue(Effect.sleep(waitForPermit))),
      );

      const queued = yield* Effect.forkChild(
        runInQueue(Effect.sleep(processing).pipe(Effect.as("processed"))),
      );

      // Waiting and processing together take longer than the processing
      // timeout, the processing alone does not.
      yield* TestClock.adjust(waitForPermit);
      yield* TestClock.adjust(processing);

      expect(yield* Fiber.join(queued)).toBe("processed");
    }),
  );
});
