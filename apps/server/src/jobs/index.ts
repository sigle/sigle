import type { Duration, Schedule } from "effect";
import type { SqlClient } from "effect/sql";
import { Layer } from "effect";
import { PersistedQueue } from "effect/persistence";
import type { AppConfig } from "@/config";
import type { Database } from "@/db";
import type { GenerateImageThumbhashJob } from "@/jobs/generate-image-thumbhash";
import type { OpenTimestampsStampJob } from "@/jobs/opentimestamps-stamp";
import type { OpenTimestampsUpgradeJob } from "@/jobs/opentimestamps-upgrade";
import type { PublishDraftJob } from "@/jobs/publish-draft";
import type { JobRuntime } from "@/queue/core";
import type { ArweaveService } from "@/services/arweave";
import type { ImageProcessingService } from "@/services/image-processing";
import type { OpenTimestampsService } from "@/services/opentimestamps";
import type { PostHogService } from "@/services/posthog";
import {
  generateImageThumbhashJob,
  GenerateImageThumbhashWorkerLive,
} from "@/jobs/generate-image-thumbhash";
import { MediaImageReconcileLive } from "@/jobs/media-image-reconcile";
import { OpenTimestampsReconcileLive } from "@/jobs/opentimestamps-reconcile";
import {
  opentimestampsStampJob,
  OpenTimestampsStampWorkerLive,
} from "@/jobs/opentimestamps-stamp";
import {
  opentimestampsUpgradeJob,
  OpenTimestampsUpgradeWorkerLive,
} from "@/jobs/opentimestamps-upgrade";
import { PlanReconcileLive } from "@/jobs/plan-reconcile";
import { PostArweaveBlockLive } from "@/jobs/post-arweave-block";
import { publishDraftJob, PublishDraftWorkerLive } from "@/jobs/publish-draft";
import { JobAdminService } from "@/queue/admin";
import { QueueStoreLive } from "@/queue/store";

/** All registered jobs. Workers and queue services are wired from this list. */
export const jobs = [
  publishDraftJob,
  opentimestampsStampJob,
  opentimestampsUpgradeJob,
  generateImageThumbhashJob,
] as const;

/** Names of the queues of the registered jobs. */
export const queueNames = jobs.map((job) => job.name);

export type QueueName = (typeof queueNames)[number];

export const QueueCleanupLive = PersistedQueue.layerCleanup({
  interval: "1 hour",
  timeToLive: "7 days",
});

export const JobsLive = Layer.mergeAll(
  PublishDraftWorkerLive,
  OpenTimestampsStampWorkerLive,
  OpenTimestampsUpgradeWorkerLive,
  GenerateImageThumbhashWorkerLive,
  OpenTimestampsReconcileLive,
  MediaImageReconcileLive,
  PlanReconcileLive,
  PostArweaveBlockLive,
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
  | PersistedQueue.PersistedQueue<GenerateImageThumbhashJob>
  | JobRuntime
  | JobAdminService,
  never,
  | SqlClient.SqlClient
  | Database
  | AppConfig
  | ArweaveService
  | ImageProcessingService
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
    generateImageThumbhashJob.makeLayer(queueOverrides),
  );

  const workerLayers = Layer.mergeAll(
    publishDraftJob.workerLayer({ concurrency: 1 }),
    opentimestampsStampJob.workerLayer({ concurrency: 1 }),
    opentimestampsUpgradeJob.workerLayer({ concurrency: 1 }),
    generateImageThumbhashJob.workerLayer({ concurrency: 1 }),
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
