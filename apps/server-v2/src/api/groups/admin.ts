import { Schema } from "effect";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "effect/http-api";
import { AdminMiddleware } from "@/api/middleware/admin";
import { UserAuthMiddleware } from "@/api/middleware/auth-user";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";
import {
  BadRequest,
  documentPaginationQuery,
  NotFound,
  paginationQueryFields,
} from "@/api/schemas";
import { queueNames } from "@/jobs";

export const ADMIN_LIST_DEFAULT_LIMIT = 20;

export const ADMIN_LIST_MAX_LIMIT = 100;

const DateTime = Schema.DateTimeUtcFromString.pipe(
  Schema.annotateEncoded({ format: "date-time" }),
);

/**
 * Queue of a registered job. An unknown name is rejected with a 400 instead of
 * reading an empty queue.
 */
export const QueueNameParam = Schema.Literals(queueNames).annotate({
  identifier: "QueueName",
});

export const QueueStatsItem = Schema.Struct({
  queueName: Schema.String,
  pending: Schema.Int,
  active: Schema.Int,
  completed: Schema.Int,
  failed: Schema.Int,
  oldestPendingAgeMillis: Schema.NullOr(Schema.Int),
}).annotate({ identifier: "QueueStatsItem" });

export const AdminQueueListResponse = Schema.Struct({
  results: Schema.Array(QueueStatsItem),
}).annotate({ identifier: "AdminQueueListResponse" });

export const FailedJobListItem = Schema.Struct({
  id: Schema.String,
  queueName: Schema.String,
  payload: Schema.Json,
  attempts: Schema.Int,
  lastFailure: Schema.NullOr(Schema.String),
  updatedAt: DateTime,
}).annotate({ identifier: "FailedJobListItem" });

export const FailedJobListQuery = Schema.Struct(
  paginationQueryFields(ADMIN_LIST_MAX_LIMIT),
).annotate({ identifier: "FailedJobListQuery" });

export const FailedJobListResponse = Schema.Struct({
  results: Schema.Array(FailedJobListItem),
  limit: Schema.Int,
  offset: Schema.Int,
  total: Schema.Int,
}).annotate({ identifier: "FailedJobListResponse" });

export const RetryFailedJobResponse = Schema.Struct({
  success: Schema.Boolean,
}).annotate({ identifier: "RetryFailedJobResponse" });

export const AdminGroup = HttpApiGroup.make("admin")
  .add(
    HttpApiEndpoint.get("listQueues", "/queues", {
      success: AdminQueueListResponse,
    })
      .annotate(OpenApi.Summary, "List queue statistics")
      .annotate(
        OpenApi.Description,
        "Return pending, active, completed, and failed job counts per queue, including registered queues without jobs.",
      ),
    HttpApiEndpoint.get("listFailedJobs", "/queues/:queueName/failed", {
      params: {
        queueName: QueueNameParam,
      },
      query: FailedJobListQuery,
      success: FailedJobListResponse,
      error: BadRequest,
    })
      .annotate(OpenApi.Summary, "List failed jobs")
      .annotate(
        OpenApi.Transform,
        documentPaginationQuery(ADMIN_LIST_MAX_LIMIT),
      )
      .annotate(
        OpenApi.Description,
        "List dead-lettered jobs of a queue, most recently failed first.",
      ),
    HttpApiEndpoint.post(
      "retryFailedJob",
      "/queues/:queueName/failed/:id/retry",
      {
        params: {
          queueName: QueueNameParam,
          id: Schema.String,
        },
        success: RetryFailedJobResponse,
        error: [BadRequest, NotFound],
      },
    )
      .annotate(OpenApi.Summary, "Retry a failed job")
      .annotate(
        OpenApi.Description,
        "Reset a dead-lettered job so workers pick it up again.",
      ),
    HttpApiEndpoint.delete("deleteFailedJob", "/queues/:queueName/failed/:id", {
      params: {
        queueName: QueueNameParam,
        id: Schema.String,
      },
      success: HttpApiSchema.NoContent,
      error: [BadRequest, NotFound],
    })
      .annotate(OpenApi.Summary, "Delete a failed job")
      .annotate(
        OpenApi.Description,
        "Permanently remove a dead-lettered job from the queue.",
      ),
  )
  .prefix("/api/protected/admin")
  .middleware(RateLimitMiddleware)
  .middleware(AdminMiddleware)
  .middleware(UserAuthMiddleware);
