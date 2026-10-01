import { Layer, Schedule, type Schema } from "effect";
import { PersistedQueue } from "effect/persistence";
import { JobAdminService } from "@/queue/admin";
import { type Job } from "@/queue/core";
import { TestDatabaseLayer } from "@/test/layer";

/**
 * Builds the queue framework (store, queue, workers, admin service) against a
 * PGlite database for integration tests.
 */
export const makeJobTestLayer = <S extends Schema.Constraint, R>(
  job: Job<S, R>,
  options?: {
    readonly concurrency?: number | undefined;
    readonly maxAttempts?: number | undefined;
    readonly reporters?: Layer.Layer<never> | undefined;
    readonly enableWorkers?: boolean | undefined;
  },
) => {
  const queueLayer = job.makeLayer({
    maxAttempts: options?.maxAttempts,
    retrySchedule: Schedule.spaced("0 millis"),
  });

  const workerAndQueueLayer =
    options?.enableWorkers === false
      ? queueLayer
      : job
          .workerLayer({
            concurrency: options?.concurrency ?? 1,
            maxAttempts: options?.maxAttempts,
          })
          .pipe(Layer.provideMerge(queueLayer));

  return Layer.mergeAll(workerAndQueueLayer, JobAdminService.layer).pipe(
    Layer.provideMerge(PersistedQueue.layer),
    Layer.provideMerge(
      PersistedQueue.layerStoreSql({ pollInterval: "15 millis" }).pipe(
        Layer.orDie,
      ),
    ),
    Layer.provideMerge(options?.reporters ?? Layer.empty),
    Layer.provideMerge(TestDatabaseLayer),
  );
};
