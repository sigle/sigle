import { DateTime, Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { SigleApi } from "@/api";
import {
  ADMIN_LIST_DEFAULT_LIMIT,
  type FailedJobListQuery,
} from "@/api/groups/admin";
import { NotFound } from "@/api/schemas";
import { JobAdminService } from "@/queue/admin";

export const listQueues = Effect.gen(function* () {
  const admin = yield* JobAdminService;

  return {
    results: yield* admin.getQueueStats,
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

export const retryFailedJob = (queueName: string, id: string) =>
  Effect.gen(function* () {
    const admin = yield* JobAdminService;
    const retried = yield* admin.retryFailedJob(queueName, id);

    if (!retried) {
      return yield* new NotFound({ message: "Failed job not found" });
    }

    return { success: true };
  });

export const deleteFailedJob = (queueName: string, id: string) =>
  Effect.gen(function* () {
    const admin = yield* JobAdminService;
    const deleted = yield* admin.deleteFailedJob(queueName, id);

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
        retryFailedJob(params.queueName, params.id),
      )
      .handle("deleteFailedJob", ({ params }) =>
        deleteFailedJob(params.queueName, params.id),
      ),
);
