import { DateTime, Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import type { FailedJobListQuery } from "@/api/groups/admin";
import type { QueueStats } from "@/queue/admin";
import { SigleApi } from "@/api";
import { ADMIN_LIST_DEFAULT_LIMIT } from "@/api/groups/admin";
import { NotFound } from "@/api/schemas";
import { queueNames } from "@/jobs";
import { JobAdminService } from "@/queue/admin";

const emptyQueueStats = (queueName: string): QueueStats => ({
  queueName,
  pending: 0,
  active: 0,
  completed: 0,
  failed: 0,
  oldestPendingAgeMillis: null,
});

export const listQueues = Effect.gen(function* () {
  const admin = yield* JobAdminService;
  const stats = yield* admin.getQueueStats;

  // The stats only cover queues with rows, so registered queues without jobs
  // are added with zero counts. Rows of a queue that is no longer registered
  // are still listed.
  const names = [
    ...new Set([...queueNames, ...stats.map((queue) => queue.queueName)]),
  ].toSorted();

  return {
    results: names.map(
      (name) =>
        stats.find((queue) => queue.queueName === name) ??
        emptyQueueStats(name),
    ),
  };
});

export const listFailedJobs = (
  queueName: string,
  query: typeof FailedJobListQuery.Type,
) =>
  Effect.gen(function* () {
    const admin = yield* JobAdminService;
    const limit = query.limit ?? ADMIN_LIST_DEFAULT_LIMIT;
    const offset = query.offset ?? 0;

    const page = yield* admin.listFailed({ queueName, limit, offset });

    return {
      results: page.results.map((job) => ({
        ...job,
        updatedAt: DateTime.fromDateUnsafe(job.updatedAt),
      })),
      limit,
      offset,
      total: page.total,
    };
  });

export const retryFailedJob = (queueName: string, jobId: string) =>
  Effect.gen(function* () {
    const admin = yield* JobAdminService;
    const retried = yield* admin.retryFailedJob(queueName, jobId);

    if (!retried) {
      return yield* new NotFound({ message: "Failed job not found" });
    }
  });

export const deleteFailedJob = (queueName: string, jobId: string) =>
  Effect.gen(function* () {
    const admin = yield* JobAdminService;
    const deleted = yield* admin.deleteFailedJob(queueName, jobId);

    if (!deleted) {
      return yield* new NotFound({ message: "Failed job not found" });
    }
  });

export const AdminHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "admin",
  (handlers) =>
    handlers
      .handle("listQueues", () => listQueues)
      .handle("listFailedJobs", ({ params, query }) =>
        listFailedJobs(params.queueName, query),
      )
      .handle("retryFailedJob", ({ params }) =>
        retryFailedJob(params.queueName, params.jobId),
      )
      .handle("deleteFailedJob", ({ params }) =>
        deleteFailedJob(params.queueName, params.jobId),
      ),
);
