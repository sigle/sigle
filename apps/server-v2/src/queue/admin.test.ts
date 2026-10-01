import { describe, expect, it } from "@effect/vitest";
import { PostMetadataSchemaId } from "@sigle/sdk";
import { Deferred, Effect, ErrorReporter, Exit, Layer, Schedule } from "effect";
import { SqlClient } from "effect/sql";
import { makeQueuesTestLayer } from "@/jobs";
import {
  PUBLISH_DRAFT_QUEUE_NAME,
  publishDraftJob,
  publishDraftJobId,
} from "@/jobs/publish-draft";
import { JobAdminService } from "@/queue/admin";
import {
  ARWEAVE_TEST_UPLOAD,
  ArweaveService,
  ArweaveUploadError,
} from "@/services/arweave";
import { PostHogService } from "@/services/posthog";
import { createTestDraft, createTestUser } from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";

const sampleMetadataJson = JSON.stringify({
  $schema: PostMetadataSchemaId.LATEST,
  name: "Admin Test",
  content: {
    id: "admin-draft",
    title: "Admin Test",
    content: "Admin test content",
    tags: ["test"],
  },
});

const AUTHOR_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

const databaseAndServices = (options: {
  readonly shouldFail: () => boolean;
  readonly reporter?: ErrorReporter.ErrorReporter | undefined;
}) =>
  Layer.mergeAll(
    TestDatabaseLayer,
    ArweaveService.layerTest([], () =>
      options.shouldFail()
        ? Effect.fail(new ArweaveUploadError({ message: "gateway down" }))
        : Effect.succeed(ARWEAVE_TEST_UPLOAD),
    ),
    PostHogService.layerTest(),
    options.reporter === undefined
      ? Layer.empty
      : ErrorReporter.layer([options.reporter]),
  );

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
        makeQueuesTestLayer({ enableWorkers: false }).pipe(
          Layer.provideMerge(databaseAndServices({ shouldFail: () => true })),
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

      const layer = makeQueuesTestLayer({
        pollInterval: "15 millis",
        retrySchedule: Schedule.spaced("0 millis"),
        maxAttempts: 2,
      }).pipe(
        Layer.provideMerge(
          databaseAndServices({
            shouldFail: () => shouldFail,
            reporter,
          }),
        ),
      );

      const waitForCompletedJobs = (expected: number) =>
        Effect.gen(function* () {
          const admin = yield* JobAdminService;

          for (let attempt = 0; attempt < 200; attempt++) {
            const stats = yield* admin.getQueueStats;

            const queue = stats.find(
              (item) => item.queueName === PUBLISH_DRAFT_QUEUE_NAME,
            );

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
        const user = yield* createTestUser();

        yield* createTestDraft({
          id: "admin-draft-1",
          userId: user.id,
          txStatus: "PENDING",
        });
        yield* createTestDraft({
          id: "admin-draft-2",
          userId: user.id,
          txStatus: "PENDING",
        });

        const firstId = publishDraftJobId("admin-draft-1");
        const secondId = publishDraftJobId("admin-draft-2");

        for (const draftId of ["admin-draft-1", "admin-draft-2"]) {
          yield* publishDraftJob.offer(
            {
              draftId,
              userId: user.id,
              authorAddress: AUTHOR_ADDRESS,
              signature: `sig-${draftId}`,
              metadataJson: sampleMetadataJson,
            },
            { id: publishDraftJobId(draftId) },
          );
        }

        yield* Deferred.await(failedDone);
        yield* Effect.sleep("40 millis");

        const page = yield* admin.listFailed({
          queueName: PUBLISH_DRAFT_QUEUE_NAME,
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
          PUBLISH_DRAFT_QUEUE_NAME,
          firstId,
        );

        yield* waitForCompletedJobs(1);

        const deleted = yield* admin.deleteFailedJob(
          PUBLISH_DRAFT_QUEUE_NAME,
          secondId,
        );

        const deleteCompleted = yield* admin.deleteFailedJob(
          PUBLISH_DRAFT_QUEUE_NAME,
          firstId,
        );

        const cleared = yield* admin.clearJob(
          PUBLISH_DRAFT_QUEUE_NAME,
          firstId,
        );

        const remaining = yield* admin.listFailed({
          queueName: PUBLISH_DRAFT_QUEUE_NAME,
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
