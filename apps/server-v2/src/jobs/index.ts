import { type Duration, Layer, type Schedule } from "effect";
import { PersistedQueue } from "effect/persistence";
import { type SqlClient } from "effect/sql";
import { type Database } from "@/db";
import {
  publishDraftJob,
  type PublishDraftJob,
  PublishDraftWorkerLive,
} from "@/jobs/publish-draft";
import { JobAdminService } from "@/queue/admin";
import { type JobRuntime } from "@/queue/core";
import { QueueStoreLive } from "@/queue/store";
import { type ArweaveService } from "@/services/arweave";
import { type PostHogService } from "@/services/posthog";

/** All registered jobs. Workers and queue services are wired from this list. */
export const jobs = [publishDraftJob] as const;

export const QueueCleanupLive = PersistedQueue.layerCleanup({
  interval: "1 hour",
  timeToLive: "7 days",
});

export const JobsLive = Layer.mergeAll(
  PublishDraftWorkerLive,
  JobAdminService.layer,
  QueueCleanupLive,
).pipe(
  Layer.provideMerge(PersistedQueue.layer),
  Layer.provideMerge(QueueStoreLive),
);

export const makeQueuesTestLayer = (options?: {
  readonly pollInterval?: Duration.Input | undefined;
  readonly retrySchedule?: Schedule.Schedule<unknown, number> | undefined;
  readonly maxAttempts?: number | undefined;
  readonly enableWorkers?: boolean | undefined;
}): Layer.Layer<
  PersistedQueue.PersistedQueue<PublishDraftJob> | JobRuntime | JobAdminService,
  never,
  SqlClient.SqlClient | Database | ArweaveService | PostHogService
> => {
  const storeLayer = PersistedQueue.layerStoreSql({
    pollInterval: options?.pollInterval ?? "20 millis",
  }).pipe(Layer.orDie);

  const queueLayer = publishDraftJob.makeLayer({
    maxAttempts: options?.maxAttempts,
    retrySchedule: options?.retrySchedule,
  });

  const workerAndQueueLayer =
    options?.enableWorkers === false
      ? queueLayer
      : publishDraftJob
          .workerLayer({ concurrency: 1 })
          .pipe(Layer.provideMerge(queueLayer));

  return Layer.mergeAll(
    workerAndQueueLayer,
    JobAdminService.layer,
    QueueCleanupLive,
  ).pipe(
    Layer.provideMerge(PersistedQueue.layer),
    Layer.provideMerge(storeLayer),
  );
};
