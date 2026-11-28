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
  description: "Registered background job queue name.",
});

const JOB_ID_PARAM = Schema.String.annotate({
  description: "ID of the dead-lettered job.",
});

export const QueueStatsItem = Schema.Struct({
  queueName: Schema.String.annotate({
    description: "Registered queue name.",
  }),
  pending: NonNegativeInt.annotate({
    description: "Number of jobs waiting to be picked up.",
  }),
  active: NonNegativeInt.annotate({
    description: "Number of jobs currently executing.",
  }),
  completed: NonNegativeInt.annotate({
    description: "Number of jobs completed.",
  }),
  failed: NonNegativeInt.annotate({
    description: "Number of dead-lettered jobs that exhausted retries.",
  }),
  oldestPendingAgeMillis: Schema.NullOr(NonNegativeInt).annotate({
    description:
      "Age of the oldest pending job in milliseconds, or `null` if no jobs are pending.",
  }),
}).annotate({
  identifier: "QueueStatsItem",
  description: "Job count metrics for a single background queue.",
});

export const AdminQueueListResponse = Schema.Struct({
  results: Schema.Array(QueueStatsItem).annotate({
    description: "Statistics for every registered job queue.",
  }),
}).annotate({
  identifier: "AdminQueueListResponse",
  description: "Overview of all registered background job queues.",
});

export const FailedJobListItem = Schema.Struct({
  id: Schema.String.annotate({
    description: "ID of the failed job.",
  }),
  queueName: Schema.String.annotate({
    description: "Queue the job belongs to.",
  }),
  payload: Schema.Json.annotate({
    description: "Original JSON payload passed to the job.",
  }),
  attempts: NonNegativeInt.annotate({
    description: "Total execution attempts made before dead-lettering.",
  }),
  lastFailure: Schema.NullOr(Schema.String).annotate({
    description: "Error message from the final failed attempt, or `null`.",
  }),
  updatedAt: DateTime.pipe(
    Schema.annotateEncoded({
      description: "ISO 8601 timestamp of the final failure.",
    }),
  ),
}).annotate({
  identifier: "FailedJobListItem",
  description: "Metadata and failure details of a dead-lettered job.",
});

export const FailedJobListQuery = Schema.Struct(
  paginationQueryFields(ADMIN_LIST_MAX_LIMIT),
).annotate({ identifier: "FailedJobListQuery" });

export const FailedJobListResponse = Schema.Struct({
  results: Schema.Array(FailedJobListItem).annotate({
    description:
      "Dead-lettered jobs for the requested page, most recently failed first.",
  }),
  limit: NonNegativeInt.annotate({
    description: "Maximum number of failed jobs requested per page.",
  }),
  offset: NonNegativeInt.annotate({
    description: "Number of failed jobs skipped from the start of the list.",
  }),
  total: NonNegativeInt.annotate({
    description: "Total number of dead-lettered jobs in the queue.",
  }),
}).annotate({
  identifier: "FailedJobListResponse",
  description: "Paginated list of dead-lettered jobs for a queue.",
});

export const AdminGroup = HttpApiGroup.make("admin")
  .annotate(OpenApi.Title, "Admin")
  .annotate(
    OpenApi.Description,
    "Internal background job queue inspection and dead-letter recovery for admin wallets.",
  )
  // Internal routes, kept out of the public OpenAPI document and the SDK.
  .annotate(OpenApi.Exclude, true)
  .add(
    HttpApiEndpoint.get("listQueues", "/queues", {
      success: AdminQueueListResponse,
    })
      .annotate(OpenApi.Summary, "List queue stats")
      .annotate(
        OpenApi.Description,
        "Returns pending, active, completed, and failed job counts for every registered queue, including idle queues.",
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
        "Returns dead-lettered jobs for a queue, ordered most recently failed first.",
      ),
    HttpApiEndpoint.post(
      "retryFailedJob",
      "/queues/:queueName/failed/:jobId/retry",
      {
        params: {
          queueName: QueueNameParam,
          jobId: JOB_ID_PARAM,
        },
        success: HttpApiSchema.NoContent.annotate({
          description: "Job re-queued for execution.",
        }),
        error: [BadRequest, NotFound],
      },
    )
      .annotate(OpenApi.Summary, "Retry failed job")
      .annotate(
        OpenApi.Description,
        "Resets a dead-lettered job back to pending so workers pick it up again.",
      ),
    HttpApiEndpoint.delete(
      "deleteFailedJob",
      "/queues/:queueName/failed/:jobId",
      {
        params: {
          queueName: QueueNameParam,
          jobId: JOB_ID_PARAM,
        },
        success: HttpApiSchema.NoContent.annotate({
          description: "Failed job permanently removed.",
        }),
        error: [BadRequest, NotFound],
      },
    )
      .annotate(OpenApi.Summary, "Delete failed job")
      .annotate(
        OpenApi.Description,
        "Permanently removes a dead-lettered job from the queue.",
      ),
  )
  .prefix("/api/admin")
  .middleware(RateLimitMiddleware)
  .middleware(AdminMiddleware)
  .middleware(UserAuthMiddleware);
