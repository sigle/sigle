import { Context, Effect, Layer, Option, Schema } from "effect";
import { SqlClient } from "effect/sql";

export interface QueueStats {
  readonly queueName: string;
  readonly pending: number;
  readonly active: number;
  readonly completed: number;
  readonly failed: number;
  readonly oldestPendingAgeMillis: number | null;
}

export interface JobsSummary {
  readonly pending: number;
  readonly active: number;
  readonly completed: number;
  readonly failed: number;
  readonly oldestPendingAgeMillis: number | null;
}

export interface FailedJob {
  readonly id: string;
  readonly queueName: string;
  readonly payload: Schema.Json;
  readonly attempts: number;
  readonly lastFailure: string | null;
  readonly updatedAt: Date;
}

export interface FailedJobPage {
  readonly results: ReadonlyArray<FailedJob>;
  readonly total: number;
}

export interface ListFailedOptions {
  readonly queueName: string;
  readonly limit: number;
  readonly offset: number;
}

export interface JobAdmin {
  readonly getSummary: Effect.Effect<JobsSummary>;
  readonly getQueueStats: Effect.Effect<ReadonlyArray<QueueStats>>;
  readonly listFailed: (
    options: ListFailedOptions,
  ) => Effect.Effect<FailedJobPage>;
  readonly retryFailedJob: (
    queueName: string,
    id: string,
  ) => Effect.Effect<boolean>;
  readonly deleteFailedJob: (
    queueName: string,
    id: string,
  ) => Effect.Effect<boolean>;
  readonly clearJob: (queueName: string, id: string) => Effect.Effect<boolean>;
}

const parseElementJson = (raw: string): Schema.Json =>
  Option.getOrElse(
    Schema.decodeOption(Schema.fromJsonString(Schema.Json))(raw),
    () => raw,
  );

const pendingAgeMillis = (
  oldestPending: Date | string | null,
): number | null =>
  oldestPending === null
    ? null
    : Math.max(0, Date.now() - new Date(oldestPending).getTime());

export const makeJobAdmin = Effect.gen(function* () {
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();

  const getQueueStats: Effect.Effect<ReadonlyArray<QueueStats>> = Effect.gen(
    function* () {
      const rows = yield* sql<{
        readonly queue_name: string;
        readonly pending: number;
        readonly active: number;
        readonly completed: number;
        readonly failed: number;
        readonly oldest_pending: Date | string | null;
      }>`
        SELECT
          queue_name,
          COUNT(*) FILTER (WHERE state = 'pending' AND acquired_by IS NULL)::INT AS pending,
          COUNT(*) FILTER (WHERE state = 'pending' AND acquired_by IS NOT NULL)::INT AS active,
          COUNT(*) FILTER (WHERE state = 'completed')::INT AS completed,
          COUNT(*) FILTER (WHERE state = 'failed')::INT AS failed,
          MIN(created_at) FILTER (WHERE state = 'pending' AND acquired_by IS NULL) AS oldest_pending
        FROM effect_queue
        GROUP BY queue_name
        ORDER BY queue_name
      `;

      return rows.map((row) => ({
        queueName: row.queue_name,
        pending: Number(row.pending),
        active: Number(row.active),
        completed: Number(row.completed),
        failed: Number(row.failed),
        oldestPendingAgeMillis: pendingAgeMillis(row.oldest_pending),
      }));
    },
  ).pipe(Effect.orDie);

  const getSummary: Effect.Effect<JobsSummary> = Effect.gen(function* () {
    const stats = yield* getQueueStats;

    const oldestAges = stats
      .map((queue) => queue.oldestPendingAgeMillis)
      .filter((age): age is number => age !== null);

    return {
      pending: stats.reduce((total, queue) => total + queue.pending, 0),
      active: stats.reduce((total, queue) => total + queue.active, 0),
      completed: stats.reduce((total, queue) => total + queue.completed, 0),
      failed: stats.reduce((total, queue) => total + queue.failed, 0),
      oldestPendingAgeMillis:
        oldestAges.length === 0 ? null : Math.min(...oldestAges),
    };
  });

  const listFailed = (
    options: ListFailedOptions,
  ): Effect.Effect<FailedJobPage> =>
    Effect.gen(function* () {
      const [totals] = yield* sql<{ readonly count: number }>`
        SELECT COUNT(*)::INT AS count
        FROM effect_queue
        WHERE state = 'failed' AND queue_name = ${options.queueName}
      `;

      const rows = yield* sql<{
        readonly id: string;
        readonly element: string;
        readonly attempts: number;
        readonly last_failure: string | null;
        readonly updated_at: Date | string;
      }>`
        SELECT id, element, attempts, last_failure, updated_at
        FROM effect_queue
        WHERE state = 'failed' AND queue_name = ${options.queueName}
        ORDER BY updated_at DESC
        LIMIT ${options.limit} OFFSET ${options.offset}
      `;

      return {
        results: rows.map((row) => ({
          id: row.id,
          queueName: options.queueName,
          payload: parseElementJson(row.element),
          attempts: Number(row.attempts),
          lastFailure: row.last_failure,
          updatedAt: new Date(row.updated_at),
        })),
        total: Number(totals?.count ?? 0),
      };
    }).pipe(Effect.orDie);

  const retryFailedJob = (
    queueName: string,
    id: string,
  ): Effect.Effect<boolean> =>
    Effect.gen(function* () {
      const rows = yield* sql<{ readonly id: string }>`
        UPDATE effect_queue
        SET state = 'pending',
            attempts = 0,
            acquired_at = NULL,
            acquired_by = NULL,
            visible_at = NOW(),
            updated_at = NOW()
        WHERE queue_name = ${queueName}
          AND id = ${id}
          AND state = 'failed'
        RETURNING id
      `;

      return rows.length > 0;
    }).pipe(Effect.orDie);

  const deleteFailedJob = (
    queueName: string,
    id: string,
  ): Effect.Effect<boolean> =>
    Effect.gen(function* () {
      const rows = yield* sql<{ readonly id: string }>`
        DELETE FROM effect_queue
        WHERE queue_name = ${queueName}
          AND id = ${id}
          AND state = 'failed'
        RETURNING id
      `;

      return rows.length > 0;
    }).pipe(Effect.orDie);

  const clearJob = (queueName: string, id: string): Effect.Effect<boolean> =>
    Effect.gen(function* () {
      const rows = yield* sql<{ readonly id: string }>`
        DELETE FROM effect_queue
        WHERE queue_name = ${queueName} AND id = ${id}
        RETURNING id
      `;

      return rows.length > 0;
    }).pipe(Effect.orDie);

  return {
    getSummary,
    getQueueStats,
    listFailed,
    retryFailedJob,
    deleteFailedJob,
    clearJob,
  } satisfies JobAdmin;
});

export class JobAdminService extends Context.Service<
  JobAdminService,
  JobAdmin
>()("sigle/JobAdminService") {
  static readonly layer: Layer.Layer<
    JobAdminService,
    never,
    SqlClient.SqlClient
  > = Layer.effect(JobAdminService, makeJobAdmin);
}
