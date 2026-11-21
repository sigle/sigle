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
  DateTime,
  documentPaginationQuery,
  NonNegativeInt,
  NotFound,
  paginationQueryFields,
} from "@/api/schemas";
import { queueNames } from "@/jobs";

export const ADMIN_LIST_DEFAULT_LIMIT = 20;

export const ADMIN_LIST_MAX_LIMIT = 100;

/**
 * Queue of a registered job. An unknown name is rejected with a 400 instead of
 * reading an empty queue.
 */
export const QueueNameParam = Schema.Literals(queueNames).annotate({
  identifier: "QueueName",
});

export const QueueStatsItem = Schema.Struct({
  queueName: Schema.String,
  pending: NonNegativeInt,
  active: NonNegativeInt,
  completed: NonNegativeInt,
  failed: NonNegativeInt,
  oldestPendingAgeMillis: Schema.NullOr(NonNegativeInt),
}).annotate({ identifier: "QueueStatsItem" });

export const AdminQueueListResponse = Schema.Struct({
  results: Schema.Array(QueueStatsItem),
}).annotate({ identifier: "AdminQueueListResponse" });

export const FailedJobListItem = Schema.Struct({
  id: Schema.String,
  queueName: Schema.String,
  payload: Schema.Json,
  attempts: NonNegativeInt,
  lastFailure: Schema.NullOr(Schema.String),
  updatedAt: DateTime,
}).annotate({ identifier: "FailedJobListItem" });

export const FailedJobListQuery = Schema.Struct(
  paginationQueryFields(ADMIN_LIST_MAX_LIMIT),
).annotate({ identifier: "FailedJobListQuery" });

export const FailedJobListResponse = Schema.Struct({
  results: Schema.Array(FailedJobListItem),
  limit: NonNegativeInt,
  offset: NonNegativeInt,
  total: NonNegativeInt,
}).annotate({ identifier: "FailedJobListResponse" });

export const AdminGroup = HttpApiGroup.make("admin")
  .annotate(
    OpenApi.Description,
    "Background job queues, for admin wallets only.",
  )
  // Internal routes, kept out of the public OpenAPI document and the SDK.
  .annotate(OpenApi.Exclude, true)
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
        documentPaginationQuery({
          maxLimit: ADMIN_LIST_MAX_LIMIT,
          defaultLimit: ADMIN_LIST_DEFAULT_LIMIT,
        }),
      )
      .annotate(
        OpenApi.Description,
        "List dead-lettered jobs of a queue, most recently failed first.",
      ),
    HttpApiEndpoint.post(
      "retryFailedJob",
      "/queues/:queueName/failed/:jobId/retry",
      {
        params: {
          queueName: QueueNameParam,
          jobId: Schema.String,
        },
        success: HttpApiSchema.NoContent,
        error: [BadRequest, NotFound],
      },
    )
      .annotate(OpenApi.Summary, "Retry a failed job")
      .annotate(
        OpenApi.Description,
        "Reset a dead-lettered job so workers pick it up again. Returns a 204 once it is queued again.",
      ),
    HttpApiEndpoint.delete(
      "deleteFailedJob",
      "/queues/:queueName/failed/:jobId",
      {
        params: {
          queueName: QueueNameParam,
          jobId: Schema.String,
        },
        success: HttpApiSchema.NoContent,
        error: [BadRequest, NotFound],
      },
    )
      .annotate(OpenApi.Summary, "Delete a failed job")
      .annotate(
        OpenApi.Description,
        "Permanently remove a dead-lettered job from the queue.",
      ),
  )
  .prefix("/api/admin")
  .middleware(RateLimitMiddleware)
  .middleware(AdminMiddleware)
  .middleware(UserAuthMiddleware);
