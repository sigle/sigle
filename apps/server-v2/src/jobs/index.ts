import { type Duration, Layer, type Schedule } from "effect";
import { PersistedQueue } from "effect/persistence";
import { type SqlClient } from "effect/sql";
import { type Database } from "@/db";
import { OpenTimestampsReconcileLive } from "@/jobs/opentimestamps-reconcile";
import {
  type OpenTimestampsStampJob,
  opentimestampsStampJob,
  OpenTimestampsStampWorkerLive,
} from "@/jobs/opentimestamps-stamp";
import {
  type OpenTimestampsUpgradeJob,
  opentimestampsUpgradeJob,
  OpenTimestampsUpgradeWorkerLive,
} from "@/jobs/opentimestamps-upgrade";
import {
  publishDraftJob,
  type PublishDraftJob,
  PublishDraftWorkerLive,
} from "@/jobs/publish-draft";
import { JobAdminService } from "@/queue/admin";
import { type JobRuntime } from "@/queue/core";
import { QueueStoreLive } from "@/queue/store";
import { type ArweaveService } from "@/services/arweave";
import { type OpenTimestampsService } from "@/services/opentimestamps";
import { type PostHogService } from "@/services/posthog";

/** All registered jobs. Workers and queue services are wired from this list. */
export const jobs = [
  publishDraftJob,
  opentimestampsStampJob,
  opentimestampsUpgradeJob,
] as const;

export const QueueCleanupLive = PersistedQueue.layerCleanup({
  interval: "1 hour",
  timeToLive: "7 days",
});

export const JobsLive = Layer.mergeAll(
  PublishDraftWorkerLive,
  OpenTimestampsStampWorkerLive,
  OpenTimestampsUpgradeWorkerLive,
  OpenTimestampsReconcileLive,
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
  | PersistedQueue.PersistedQueue<PublishDraftJob>
  | PersistedQueue.PersistedQueue<OpenTimestampsStampJob>
  | PersistedQueue.PersistedQueue<OpenTimestampsUpgradeJob>
  | JobRuntime
  | JobAdminService,
  never,
  | SqlClient.SqlClient
  | Database
  | ArweaveService
  | OpenTimestampsService
  | PostHogService
> => {
  const storeLayer = PersistedQueue.layerStoreSql({
    pollInterval: options?.pollInterval ?? "20 millis",
  }).pipe(Layer.orDie);

  const queueOverrides = {
    maxAttempts: options?.maxAttempts,
    retrySchedule: options?.retrySchedule,
  };

  const queueLayers = Layer.mergeAll(
    publishDraftJob.makeLayer(queueOverrides),
    opentimestampsStampJob.makeLayer(queueOverrides),
    opentimestampsUpgradeJob.makeLayer(queueOverrides),
  );

  const workerLayers = Layer.mergeAll(
    publishDraftJob.workerLayer({ concurrency: 1 }),
    opentimestampsStampJob.workerLayer({ concurrency: 1 }),
    opentimestampsUpgradeJob.workerLayer({ concurrency: 1 }),
  ).pipe(Layer.provide(queueLayers));

  const appLayer =
    options?.enableWorkers === false
      ? queueLayers
      : Layer.mergeAll(queueLayers, workerLayers);

  return Layer.mergeAll(appLayer, JobAdminService.layer, QueueCleanupLive).pipe(
    Layer.provideMerge(PersistedQueue.layer),
    Layer.provideMerge(storeLayer),
  );
};
