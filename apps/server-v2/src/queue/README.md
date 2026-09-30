# Jobs & queue

Effect-native background jobs for server-v2, built on `PersistedQueue`
(`effect/unstable/persistence`) with the Postgres/PGlite SQL store. Jobs survive
restarts, are claimed with row locks (safe across replicas), and are retried
with backoff.

## Defining a job

One job per queue, one file per job under `src/jobs/`. Use `defineJob` from
`@/queue/core`:

```ts
export const publishDraftJob = defineJob({
  name: "publish-draft",
  payload: PublishDraftJobSchema, // Effect Schema, persisted as JSON
  maxAttempts: 3,
  retrySchedule: Schedule.jittered(
    Schedule.min([
      Schedule.exponential("5 seconds"),
      Schedule.spaced("2 minutes"),
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
  reportPayload: (payload) => ({ draftId: payload.draftId }),
});
```

Producers enqueue with a stable id (duplicate offers are ignored while the row
exists):

```ts
const program = Effect.gen(function* () {
  yield* publishDraftJob.offer(payload, { id: `publish-draft:${draftId}` });
});
```

## Registering

Add the job's live worker layer to `JobsLive` in `src/jobs/index.ts`. Workers
run in the API process; `JobsLive` also wires `JobAdminService` and hourly
cleanup.

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

## Monitoring

- `GET /health` includes an informational aggregate queue summary.
- Admin API, gated by a wallet address listed in `ADMIN_ADDRESSES` (empty list
  locks it for everyone):
  - `GET /api/protected/admin/queues`
  - `GET /api/protected/admin/queues/:queueName/failed?limit&offset`
  - `POST /api/protected/admin/queues/:queueName/failed/:id/retry`
  - `DELETE /api/protected/admin/queues/:queueName/failed/:id`

## Testing

`makeQueuesTestLayer({ pollInterval, retrySchedule, maxAttempts, enableWorkers })`
builds the full queue stack against PGlite for integration tests; unit-test
handlers by calling the `process` function directly.

## Deferred

Cron/scheduled jobs, delayed starts, priorities, batching, an admin UI, metric
scraping, separate worker processes, and porting the v1 (pg-boss) `indexer` and
`generate-image-blurhash` jobs.
