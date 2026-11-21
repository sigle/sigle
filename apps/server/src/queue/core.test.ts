import { describe, expect, it } from "@effect/vitest";
import {
  Data,
  Deferred,
  Effect,
  ErrorReporter,
  Exit,
  Option,
  Schema,
} from "effect";
import { JobAdminService, type QueueStats } from "@/queue/admin";
import { defineJob, terminal } from "@/queue/core";
import { makeJobTestLayer } from "@/queue/test-layer";

class TestJobError extends Data.TaggedError("TestJobError")<{
  readonly message: string;
}> {}

const TestPayloadSchema = Schema.Struct({
  value: Schema.String,
});

const testPayload = (value: string): typeof TestPayloadSchema.Type => ({
  value,
});

const JobFailureAttributesSchema = Schema.Struct({
  queue: Schema.String,
  jobId: Schema.String,
  attempts: Schema.Finite,
  payload: Schema.String,
});

const decodeJobFailureAttributes = Schema.decodeUnknownOption(
  JobFailureAttributesSchema,
);

const waitForQueueStats = (
  queueName: string,
  predicate: (stats: QueueStats) => boolean,
) =>
  Effect.gen(function* () {
    const admin = yield* JobAdminService;

    for (let attempt = 0; attempt < 200; attempt++) {
      const stats = yield* admin.getQueueStats;
      const queue = stats.find((item) => item.queueName === queueName);

      if (queue !== undefined && predicate(queue)) {
        return queue;
      }

      yield* Effect.sleep("20 millis");
    }

    return yield* Effect.die(
      new Error(`timed out waiting for ${queueName} queue stats`),
    );
  });

describe(defineJob, () => {
  it.live("processes jobs, deduplicates offers by id, and reports stats", () =>
    Effect.gen(function* () {
      const processed: Array<string> = [];
      const done = yield* Deferred.make<void>();
      const rerunDone = yield* Deferred.make<void>();

      const job = defineJob({
        name: "core-test-process",
        payload: TestPayloadSchema,
        maxAttempts: 2,
        concurrency: 2,
        process: (payload) =>
          Effect.gen(function* () {
            processed.push(payload.value);

            if (processed.length >= 2) {
              yield* Deferred.succeed(done, undefined);
            }

            if (processed.length >= 3) {
              yield* Deferred.succeed(rerunDone, undefined);
            }
          }),
      });

      const layer = makeJobTestLayer(job, {
        concurrency: 2,
        maxAttempts: 2,
      });

      yield* Effect.gen(function* () {
        const admin = yield* JobAdminService;

        yield* job.offer(testPayload("first"), { id: "job-1" });
        // Duplicate offers with the same id must be ignored
        yield* job.offer(testPayload("first-duplicate"), { id: "job-1" });
        yield* job.offer(testPayload("second"), { id: "job-2" });

        yield* Deferred.await(done);

        const stats = yield* waitForQueueStats(
          "core-test-process",
          (queue) => queue.completed === 2,
        );

        expect({
          processed: processed.toSorted(),
          stats,
        }).toStrictEqual({
          processed: ["first", "second"],
          stats: {
            queueName: "core-test-process",
            pending: 0,
            active: 0,
            completed: 2,
            failed: 0,
            oldestPendingAgeMillis: null,
          },
        });

        // Clearing a completed row allows offering the same id again.
        const cleared = yield* admin.clearJob("core-test-process", "job-2");
        expect(cleared).toBe(true);

        yield* job.offer(testPayload("second-again"), { id: "job-2" });
        yield* Deferred.await(rerunDone);

        expect(processed).toHaveLength(3);
      }).pipe(Effect.provide(layer));
    }),
  );

  it.live(
    "retries transient failures, reports context on final failure, and supports manual retry",
    () =>
      Effect.gen(function* () {
        const attemptsSeen: Array<number> = [];

        const reports: Array<{
          message: string;
          attributes: typeof JobFailureAttributesSchema.Type | undefined;
        }> = [];

        const finalFailures: Array<string> = [];
        const failedDone = yield* Deferred.make<void>();
        const recoveredDone = yield* Deferred.make<void>();
        let shouldSucceed = false;

        const reporter = ErrorReporter.make(({ attributes, error }) => {
          reports.push({
            message: error.message,
            attributes: Option.getOrUndefined(
              decodeJobFailureAttributes(attributes),
            ),
          });
          Deferred.doneUnsafe(failedDone, Exit.void);
        });

        const job = defineJob({
          name: "core-test-retry",
          payload: TestPayloadSchema,
          maxAttempts: 2,
          reportPayload: (payload) => payload,
          process: (payload, meta) =>
            Effect.gen(function* () {
              attemptsSeen.push(meta.attempts);

              if (!shouldSucceed) {
                return yield* new TestJobError({
                  message: `boom on ${payload.value}`,
                });
              }

              yield* Deferred.succeed(recoveredDone, undefined);
            }),
          onFinalFailure: (payload) =>
            Effect.sync(() => {
              finalFailures.push(payload.value);
            }),
        });

        const layer = makeJobTestLayer(job, {
          concurrency: 1,
          maxAttempts: 2,
          reporters: ErrorReporter.layer([reporter]),
        });

        yield* Effect.gen(function* () {
          const admin = yield* JobAdminService;

          yield* job.offer(testPayload("flaky"), { id: "flaky-1" });
          yield* Deferred.await(failedDone);
          yield* waitForQueueStats(
            "core-test-retry",
            (queue) => queue.failed === 1,
          );

          const failedPage = yield* admin.listFailed({
            queueName: "core-test-retry",
            limit: 10,
            offset: 0,
          });

          expect({
            attemptsSeen,
            finalFailures,
            reports,
            total: failedPage.total,
            failedId: failedPage.results[0]?.id,
            failedAttempts: failedPage.results[0]?.attempts,
            failedPayload: failedPage.results[0]?.payload,
          }).toStrictEqual({
            attemptsSeen: [1, 2],
            finalFailures: ["flaky"],
            reports: [
              {
                message: "boom on flaky",
                attributes: {
                  queue: "core-test-retry",
                  jobId: "flaky-1",
                  attempts: 2,
                  payload: '{"value":"flaky"}',
                },
              },
            ],
            total: 1,
            failedId: "flaky-1",
            failedAttempts: 2,
            failedPayload: { value: "flaky" },
          });
          expect(failedPage.results[0]?.lastFailure).toContain("boom on flaky");

          shouldSucceed = true;

          const retried = yield* admin.retryFailedJob(
            "core-test-retry",
            "flaky-1",
          );

          expect(retried).toBe(true);

          yield* Deferred.await(recoveredDone);

          const stats = yield* waitForQueueStats(
            "core-test-retry",
            (queue) => queue.completed === 1 && queue.failed === 0,
          );

          expect({
            completed: stats.completed,
            failed: stats.failed,
          }).toStrictEqual({ completed: 1, failed: 0 });
        }).pipe(Effect.provide(layer));
      }),
  );

  it.live(
    "completes non-retryable failures without consuming remaining attempts",
    () =>
      Effect.gen(function* () {
        const attemptsSeen: Array<number> = [];

        const reports: Array<{ message: string; payload: string | undefined }> =
          [];

        const done = yield* Deferred.make<void>();

        const reporter = ErrorReporter.make(({ attributes, error }) => {
          reports.push({
            message: error.message,
            payload: Option.getOrUndefined(
              decodeJobFailureAttributes(attributes),
            )?.payload,
          });
          Deferred.doneUnsafe(done, Exit.void);
        });

        const job = defineJob({
          name: "core-test-terminal",
          payload: TestPayloadSchema,
          maxAttempts: 3,
          process: (payload, meta) =>
            Effect.gen(function* () {
              attemptsSeen.push(meta.attempts);

              return yield* terminal(
                new TestJobError({ message: `invalid ${payload.value}` }),
              );
            }),
        });

        const layer = makeJobTestLayer(job, {
          concurrency: 1,
          maxAttempts: 3,
          reporters: ErrorReporter.layer([reporter]),
        });

        yield* Effect.gen(function* () {
          yield* job.offer(testPayload("payload"), { id: "terminal-1" });
          yield* Deferred.await(done);

          const stats = yield* waitForQueueStats(
            "core-test-terminal",
            (queue) => queue.completed === 1,
          );

          expect({
            attemptsSeen,
            reports,
            stats,
          }).toStrictEqual({
            attemptsSeen: [1],
            reports: [{ message: "invalid payload", payload: "[redacted]" }],
            stats: {
              queueName: "core-test-terminal",
              pending: 0,
              active: 0,
              completed: 1,
              failed: 0,
              oldestPendingAgeMillis: null,
            },
          });
        }).pipe(Effect.provide(layer));
      }),
  );
});
