import { describe, expect, it } from "@effect/vitest";
import { Data, Deferred, Effect, ErrorReporter, Exit, Schema } from "effect";
import { SqlClient } from "effect/sql";
import { JobAdminService } from "@/queue/admin";
import { defineJob } from "@/queue/core";
import { makeJobTestLayer } from "@/queue/test-layer";

class AdminTestJobError extends Data.TaggedError("AdminTestJobError")<{
  readonly message: string;
}> {}

const AdminTestPayloadSchema = Schema.Struct({
  value: Schema.String,
});

const adminTestPayload = (
  value: string,
): typeof AdminTestPayloadSchema.Type => ({ value });

describe("job admin service", () => {
  it.effect("effect_queue still exposes every column JobAdmin relies on", () =>
    Effect.gen(function* () {
      const sql = (yield* SqlClient.SqlClient).withoutTransforms();

      const rows = yield* sql`
        SELECT id, queue_name, element, state, attempts, last_failure,
               acquired_at, acquired_by, created_at, updated_at, visible_at
        FROM effect_queue
        LIMIT 0
      `;

      expect(rows).toStrictEqual([]);
    }).pipe(
      Effect.provide(
        makeJobTestLayer(
          defineJob({
            name: "admin-drift",
            payload: AdminTestPayloadSchema,
            process: () => Effect.void,
          }),
          { enableWorkers: false },
        ),
      ),
    ),
  );

  it.live("lists, paginates, retries, deletes, and clears failed jobs", () =>
    Effect.gen(function* () {
      let shouldFail = true;
      let reported = 0;
      const failedDone = yield* Deferred.make<void>();

      const reporter = ErrorReporter.make(() => {
        reported += 1;

        if (reported >= 2) {
          Deferred.doneUnsafe(failedDone, Exit.void);
        }
      });

      const job = defineJob({
        name: "admin-test",
        payload: AdminTestPayloadSchema,
        maxAttempts: 2,
        process: (payload) =>
          shouldFail
            ? Effect.fail(
                new AdminTestJobError({ message: `boom ${payload.value}` }),
              )
            : Effect.void,
      });

      const layer = makeJobTestLayer(job, {
        concurrency: 1,
        maxAttempts: 2,
        reporters: ErrorReporter.layer([reporter]),
      });

      const waitForCompletedJobs = (expected: number) =>
        Effect.gen(function* () {
          const admin = yield* JobAdminService;

          for (let attempt = 0; attempt < 200; attempt++) {
            const stats = yield* admin.getQueueStats;
            const queue = stats.find((item) => item.queueName === "admin-test");

            if ((queue?.completed ?? 0) >= expected) {
              return;
            }

            yield* Effect.sleep("20 millis");
          }

          return yield* Effect.die(
            new Error("timed out waiting for job completion"),
          );
        });

      yield* Effect.gen(function* () {
        const admin = yield* JobAdminService;

        for (const value of ["first", "second"]) {
          yield* job.offer(adminTestPayload(value), { id: `admin-${value}` });
        }

        yield* Deferred.await(failedDone);
        yield* Effect.sleep("40 millis");

        const page = yield* admin.listFailed({
          queueName: "admin-test",
          limit: 1,
          offset: 0,
        });

        expect({
          total: page.total,
          resultCount: page.results.length,
          attempts: page.results[0]?.attempts,
        }).toStrictEqual({ total: 2, resultCount: 1, attempts: 2 });

        shouldFail = false;

        const retried = yield* admin.retryFailedJob(
          "admin-test",
          "admin-first",
        );

        yield* waitForCompletedJobs(1);

        const deleted = yield* admin.deleteFailedJob(
          "admin-test",
          "admin-second",
        );

        const deleteCompleted = yield* admin.deleteFailedJob(
          "admin-test",
          "admin-first",
        );

        const cleared = yield* admin.clearJob("admin-test", "admin-first");

        const remaining = yield* admin.listFailed({
          queueName: "admin-test",
          limit: 10,
          offset: 0,
        });

        expect({
          retried,
          deleted,
          deleteCompleted,
          cleared,
          remainingFailed: remaining.total,
        }).toStrictEqual({
          retried: true,
          deleted: true,
          deleteCompleted: false,
          cleared: true,
          remainingFailed: 0,
        });
      }).pipe(Effect.provide(layer));
    }),
  );
});
