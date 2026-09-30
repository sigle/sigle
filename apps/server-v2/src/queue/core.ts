import {
  Cause,
  Context,
  Data,
  Effect,
  ErrorReporter,
  Layer,
  Metric,
  Option,
  Schedule,
  Schema,
} from "effect";
import { PersistedQueue } from "effect/unstable/persistence";

export const DEFAULT_MAX_ATTEMPTS = 3;

export const DEFAULT_CONCURRENCY = 1;

export const defaultRetrySchedule: Schedule.Schedule<unknown, number> =
  Schedule.jittered(
    Schedule.min([
      Schedule.exponential("1 second"),
      Schedule.spaced("1 minute"),
    ]),
  );

export const jobsCompletedCounter = Metric.counter("sigle.jobs.completed", {
  description: "Total number of background jobs completed successfully",
  incremental: true,
});

export const jobsRetriedCounter = Metric.counter("sigle.jobs.retried", {
  description: "Total number of background job retry attempts scheduled",
  incremental: true,
});

export const jobsFailedFinalCounter = Metric.counter(
  "sigle.jobs.failed_final",
  {
    description:
      "Total number of background jobs that exhausted all retry attempts",
    incremental: true,
  },
);

export const jobsFailedTerminalCounter = Metric.counter(
  "sigle.jobs.failed_terminal",
  {
    description:
      "Total number of background jobs that failed with a non-retryable error",
    incremental: true,
  },
);

export const jobDurationTimer = Metric.timer("sigle.jobs.duration", {
  description: "Execution duration of background queue jobs",
});

export interface JobMeta {
  readonly id: string;
  readonly attempts: number;
}

/**
 * Wraps an error to mark it as non-retryable. The worker reports it, runs
 * `onFinalFailure`, and completes the element immediately instead of consuming
 * the remaining attempts.
 */
export class TerminalJobError extends Data.TaggedError("TerminalJobError")<{
  readonly cause: unknown;
}> {}

export const terminal = <E>(error: E): TerminalJobError =>
  new TerminalJobError({ cause: error });

const MAX_PAYLOAD_ATTRIBUTE_LENGTH = 1024;

const REDACTED_PAYLOAD_JSON = "[redacted]";

/**
 * Serializes a job payload for error reporting, truncating it to keep Sentry
 * events and logs reasonably sized.
 */
export const truncatePayload = <E>(
  payload: E,
  maxLength = MAX_PAYLOAD_ATTRIBUTE_LENGTH,
): string => {
  let encoded = "";

  try {
    encoded = JSON.stringify(payload) ?? String(payload);
  } catch {
    encoded = String(payload);
  }

  return encoded.length > maxLength
    ? `${encoded.slice(0, maxLength)}…`
    : encoded;
};

const describeError = <E>(cause: E): string =>
  cause instanceof Error ? cause.message : String(cause);

const describeCause = (cause: Cause.Cause<unknown>): string => {
  const failure = Cause.findErrorOption(cause);

  return Option.isSome(failure)
    ? describeError(failure.value)
    : Cause.pretty(cause);
};

/**
 * Error used to report a permanently failed job to `ErrorReporter` (Sentry)
 * with the queue, job id, attempts, and a truncated payload attached as
 * reporter attributes. The original error is preserved as `cause`.
 */
export class JobFailureError extends Data.TaggedError("JobFailureError")<{
  readonly queue: string;
  readonly jobId: string;
  readonly attempts: number;
  readonly message: string;
  readonly payloadJson: string;
  readonly cause: unknown;
}> {
  readonly [ErrorReporter.severity] = "Error" as const;
  readonly [ErrorReporter.attributes] = {
    queue: this.queue,
    jobId: this.jobId,
    attempts: this.attempts,
    payload: this.payloadJson,
  };
}

const findTerminalError = (
  cause: Cause.Cause<unknown>,
): TerminalJobError | undefined => {
  const failure = Cause.findErrorOption(cause);

  return Option.isSome(failure) && failure.value instanceof TerminalJobError
    ? failure.value
    : undefined;
};

export interface WorkerOverrides {
  readonly concurrency?: number | undefined;
  readonly maxAttempts?: number | undefined;
  readonly retrySchedule?: Schedule.Schedule<unknown, number> | undefined;
}

export interface JobOptions<S extends Schema.Constraint, E, R> {
  readonly name: string;
  readonly payload: S;
  readonly process: (
    payload: S["Type"],
    meta: JobMeta,
  ) => Effect.Effect<void, E, R>;
  readonly onFinalFailure?:
    | ((
        payload: S["Type"],
        cause: Cause.Cause<unknown>,
        meta: JobMeta,
      ) => Effect.Effect<void, never, R>)
    | undefined;
  /**
   * Projection of the payload attached to failure reports. Payload fields are
   * only reported when explicitly included here; the default is a redacted
   * placeholder.
   */
  readonly reportPayload?: ((payload: S["Type"]) => Schema.Json) | undefined;
  readonly maxAttempts?: number | undefined;
  readonly retrySchedule?: Schedule.Schedule<unknown, number> | undefined;
  readonly concurrency?: number | undefined;
}

export interface OfferOptions {
  readonly id?: string | undefined;
}

export type JobQueue<S extends Schema.Constraint> =
  PersistedQueue.PersistedQueue<
    S["Type"],
    S["EncodingServices"] | S["DecodingServices"]
  >;

export interface Job<S extends Schema.Constraint, R> {
  readonly name: string;
  readonly payload: S;
  readonly tag: Context.Service<JobQueue<S>, JobQueue<S>>;
  readonly maxAttempts: number;
  readonly retrySchedule: Schedule.Schedule<unknown, number>;
  readonly concurrency: number;
  readonly layer: Layer.Layer<
    JobQueue<S>,
    never,
    PersistedQueue.PersistedQueueFactory
  >;
  readonly makeLayer: (
    overrides?: WorkerOverrides,
  ) => Layer.Layer<JobQueue<S>, never, PersistedQueue.PersistedQueueFactory>;
  readonly offer: (
    payload: S["Type"],
    options?: OfferOptions,
  ) => Effect.Effect<
    string,
    PersistedQueue.PersistedQueueError | Schema.SchemaError,
    JobQueue<S> | S["DecodingServices"] | S["EncodingServices"]
  >;
  readonly workerLayer: (
    overrides?: WorkerOverrides,
  ) => Layer.Layer<
    never,
    never,
    JobQueue<S> | S["DecodingServices"] | S["EncodingServices"] | R
  >;
}

/**
 * Declares a background job backed by a `PersistedQueue`.
 *
 * Each job maps to a single queue named after the job, receives a typed payload
 * verified against `payload`, and gets a worker layer, retries with backoff,
 * Sentry reporting, and metrics for free.
 */
export const defineJob = <S extends Schema.Constraint, E, R>(
  options: JobOptions<S, E, R>,
): Job<S, R> => {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const retrySchedule = options.retrySchedule ?? defaultRetrySchedule;
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
  const onFinalFailure = options.onFinalFailure;
  const reportPayload = options.reportPayload;

  const tag = Context.Service<JobQueue<S>, JobQueue<S>>(
    `sigle/jobs/${options.name}`,
  );

  const makeLayer = (overrides?: WorkerOverrides) =>
    Layer.effect(
      tag,
      PersistedQueue.make({
        name: options.name,
        schema: options.payload,
        maxAttempts: overrides?.maxAttempts ?? maxAttempts,
        retrySchedule: overrides?.retrySchedule ?? retrySchedule,
      }),
    );

  const offer = (payload: S["Type"], offerOptions?: OfferOptions) =>
    tag.use((queue) => queue.offer(payload, { id: offerOptions?.id }));

  const workerLayer = (
    overrides?: WorkerOverrides,
  ): Layer.Layer<
    never,
    never,
    JobQueue<S> | S["DecodingServices"] | S["EncodingServices"] | R
  > =>
    Layer.effectDiscard(
      Effect.gen(function* () {
        const queue = yield* tag;
        const workerConcurrency = overrides?.concurrency ?? concurrency;
        const workerMaxAttempts = overrides?.maxAttempts ?? maxAttempts;

        const completedMetric = jobsCompletedCounter.pipe(
          Metric.withAttributes({ queue: options.name }),
        );

        const retriedMetric = jobsRetriedCounter.pipe(
          Metric.withAttributes({ queue: options.name }),
        );

        const failedFinalMetric = jobsFailedFinalCounter.pipe(
          Metric.withAttributes({ queue: options.name }),
        );

        const failedTerminalMetric = jobsFailedTerminalCounter.pipe(
          Metric.withAttributes({ queue: options.name }),
        );

        const durationMetric = jobDurationTimer.pipe(
          Metric.withAttributes({ queue: options.name }),
        );

        const describePayload = (payload: S["Type"]): string => {
          if (reportPayload === undefined) {
            return REDACTED_PAYLOAD_JSON;
          }

          try {
            return truncatePayload(reportPayload(payload));
          } catch {
            return REDACTED_PAYLOAD_JSON;
          }
        };

        const reportFailure = (
          cause: Cause.Cause<unknown>,
          payloadJson: string,
          meta: JobMeta,
        ): Effect.Effect<void> => {
          const failure = Cause.findErrorOption(cause);

          return ErrorReporter.report(
            Cause.fail(
              new JobFailureError({
                queue: options.name,
                jobId: meta.id,
                attempts: meta.attempts,
                message: describeCause(cause),
                payloadJson,
                cause: Option.isSome(failure) ? failure.value : cause,
              }),
            ),
          );
        };

        const runOnFinalFailure = (
          payload: S["Type"],
          cause: Cause.Cause<unknown>,
          meta: JobMeta,
        ) =>
          onFinalFailure === undefined
            ? Effect.void
            : Effect.suspend(() => onFinalFailure(payload, cause, meta)).pipe(
                Effect.catchCause((cause) =>
                  Effect.logError(
                    `onFinalFailure callback failed for queue ${options.name}`,
                    cause,
                  ),
                ),
              );

        const handleFailure = (
          cause: Cause.Cause<unknown>,
          payload: S["Type"],
          meta: JobMeta,
        ) =>
          Effect.gen(function* () {
            if (Cause.hasInterruptsOnly(cause)) {
              return yield* Effect.failCause(cause);
            }

            const payloadJson = describePayload(payload);
            const terminalError = findTerminalError(cause);

            if (terminalError !== undefined) {
              yield* Metric.update(failedTerminalMetric, 1);
              yield* reportFailure(
                Cause.fail(terminalError.cause),
                payloadJson,
                meta,
              );
              yield* Effect.logError(
                "Queue job failed permanently (non-retryable)",
                cause,
              );
              yield* runOnFinalFailure(
                payload,
                Cause.fail(terminalError.cause),
                meta,
              );

              return;
            }

            if (meta.attempts >= workerMaxAttempts) {
              yield* Metric.update(failedFinalMetric, 1);
              yield* reportFailure(cause, payloadJson, meta);
              yield* Effect.logError("Queue job failed permanently", cause);
              yield* runOnFinalFailure(payload, cause, meta);
            } else {
              yield* Metric.update(retriedMetric, 1);
              yield* Effect.logWarning(
                "Queue job attempt failed, scheduling retry",
                cause,
              );
            }

            return yield* Effect.failCause(cause);
          });

        const processNext = queue
          .take((payload, meta) =>
            Effect.suspend(() => options.process(payload, meta)).pipe(
              Effect.timed,
              Effect.tap(([duration]) =>
                Effect.all([
                  Metric.update(durationMetric, duration),
                  Metric.update(completedMetric, 1),
                ]),
              ),
              Effect.asVoid,
              Effect.catchCause((cause) => handleFailure(cause, payload, meta)),
              Effect.annotateLogs({
                queue: options.name,
                jobId: meta.id,
                attempts: meta.attempts,
              }),
              Effect.withSpan(`queue.${options.name}`, {
                attributes: {
                  "job.queue": options.name,
                  "job.id": meta.id,
                  "job.attempts": meta.attempts,
                },
              }),
            ),
          )
          .pipe(
            // `PersistedQueue.take` runs its SQL retry/fail finalizer before
            // re-surfacing the handler failure. Catch non-interrupt failures
            // here so the worker fiber keeps taking subsequent jobs.
            Effect.catchCauseIf(
              (cause) => !Cause.hasInterruptsOnly(cause),
              () => Effect.void,
            ),
          );

        const workerLoop = Effect.forever(processNext).pipe(
          Effect.tapCause((cause) =>
            Cause.hasInterruptsOnly(cause)
              ? Effect.void
              : Effect.logError(
                  `Worker loop error in queue ${options.name}`,
                  cause,
                ),
          ),
          Effect.retry(Schedule.spaced("1 second")),
        );

        for (let index = 0; index < workerConcurrency; index++) {
          yield* Effect.forkScoped(workerLoop);
        }
      }),
    );

  return {
    name: options.name,
    payload: options.payload,
    tag,
    maxAttempts,
    retrySchedule,
    concurrency,
    layer: makeLayer(),
    makeLayer,
    offer,
    workerLayer,
  };
};
