# Jobs & queue

Effect-native background jobs for server-v2, built on `PersistedQueue`
(`effect/persistence`) with the Postgres/PGlite SQL store. Jobs survive
restarts, are claimed with row locks (safe across replicas), and are retried
with backoff.

## Defining a job

One job per queue, one schema per job. Use `defineJob` from `@/queue/core`:

```ts
export const resizeImageJob = defineJob({
  name: "resize-image",
  payload: ResizeImageJobSchema, // Effect Schema, persisted as JSON
  maxAttempts: 3,
  retrySchedule: Schedule.jittered(
    Schedule.min([
      Schedule.exponential("1 second"),
      Schedule.spaced("1 minute"),
    ]),
  ),
  concurrency: 2,
  process: (payload, { id, attempts }) =>
    Effect.gen(function* () {
      // idempotent work
    }),
  onFinalFailure: (payload) =>
    Effect.gen(function* () {
      // mark domain state as failed
    }),
  // Fields attached to failure reports (Sentry); redacted by default.
  reportPayload: (payload) => ({ imageId: payload.imageId }),
});
```

Producers enqueue with a stable id (duplicate offers are ignored while the row
exists):

```ts
const program = Effect.gen(function* () {
  yield* resizeImageJob.offer(payload, { id: `resize-image:${imageId}` });
});
```

`defineJob` returns `layer` (provides the queue service used by `offer`) and
`workerLayer` (spawns the consumer fibers). Merge them into the layer that runs
the workers.

## Semantics

- At-least-once: handlers must be idempotent.
- Attempts are 1-based and consumed when the element is claimed; interruptions
  (deploys, shutdown) do not consume an attempt and the job is picked up again.
- `terminal(error)` marks a failure as non-retryable: the job is reported,
  `onFinalFailure` runs, and the element completes immediately.
- Exhausted jobs stay in `effect_queue` as dead letters until deleted;
  completed rows are kept for 7 days (duplicate-id window). Use
  `JobAdminService.clearJob(queue, id)` to allow re-offering the same id.
- Schema decode failures are marked failed by the queue and never reach
  handlers; they appear in the admin failed list.
- Failures are reported to Sentry (`ErrorReporter`) with `queue`, `jobId`,
  `attempts`, and the `reportPayload` projection (redacted by default, so
  payload fields are only reported when explicitly projected). Metrics:
  `sigle.jobs.completed`, `.retried`, `.failed_final`, `.failed_terminal`,
  `.duration`.

## Observability

`JobAdminService` (`@/queue/admin`) exposes the queue state: `getSummary`,
`getQueueStats`, `listFailed` (paginated), `retryFailedJob`, `deleteFailedJob`,
and `clearJob`.

## Testing

`makeJobTestLayer` from `@/queue/test-layer` builds the store, queue, workers,
and `JobAdminService` against PGlite for integration tests. Unit-test handlers
by calling the `process` function directly.

## Deferred

Cron/scheduled jobs, delayed starts, priorities, batching, the HTTP admin
surface, metric scraping, separate worker processes, and porting the v1
(pg-boss) `indexer` jobs.
