import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Effect, Exit, Layer, Option, Schedule } from "effect";
import { Database } from "@/db";
import { postOts } from "@/db/schema";
import { makeQueuesTestLayer } from "@/jobs";
import { JobAdminService, type QueueStats } from "@/queue/admin";
import { ArweaveService, type ArweaveUploadOptions } from "@/services/arweave";
import {
  OTS_TEST_UPGRADED_PROOF,
  OTS_TEST_VERIFICATION,
  OpenTimestampsService,
  type OpenTimestampsOperations,
  OtsInvalidProofError,
  OtsNotAnchoredError,
} from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import {
  createTestPost,
  createTestPostOts,
  createTestUser,
} from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";
import {
  opentimestampsUpgradeJob,
  processOpenTimestampsUpgradeJob,
} from "./opentimestamps-upgrade";

const PENDING_PROOF = Buffer.from("pending-proof");

const makeUpgradeTestLayer = (options: {
  readonly upgrade?: OpenTimestampsOperations["upgrade"];
  readonly verify?: OpenTimestampsOperations["verify"];
  readonly uploads?: Array<ArweaveUploadOptions>;
  readonly enableWorkers?: boolean;
}) => {
  const operations: OpenTimestampsOperations = {
    stamp: () => Effect.succeed(OTS_TEST_UPGRADED_PROOF),
    upgrade: options.upgrade ?? (() => Effect.succeed(OTS_TEST_UPGRADED_PROOF)),
    verify: options.verify ?? (() => Effect.succeed(OTS_TEST_VERIFICATION)),
  };

  return makeQueuesTestLayer({
    pollInterval: "15 millis",
    enableWorkers: options.enableWorkers ?? false,
    maxAttempts: 2,
    retrySchedule: Schedule.spaced("0 millis"),
  }).pipe(
    Layer.provideMerge(OpenTimestampsService.layerTest(operations)),
    Layer.provideMerge(ArweaveService.layerTest(options.uploads ?? [])),
    Layer.provideMerge(PostHogService.layerTest()),
    Layer.provideMerge(TestDatabaseLayer),
  );
};

const seedPostWithPendingProof = (options: {
  readonly postId: string;
  readonly status?: "PENDING" | "FAILED";
}) =>
  Effect.gen(function* () {
    const user = yield* createTestUser();

    yield* createTestPost({
      id: options.postId,
      userId: user.id,
      arweaveTxId: options.postId,
    });

    yield* createTestPostOts({
      postId: options.postId,
      status: options.status ?? "PENDING",
      contentHash: "c".repeat(64),
      pendingProof: PENDING_PROOF,
    });
  });

const waitForPostOtsStatus = (postId: string, status: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    for (let attempt = 0; attempt < 200; attempt++) {
      const [row] = yield* db
        .select({ status: postOts.status })
        .from(postOts)
        .where(eq(postOts.postId, postId))
        .limit(1)
        .pipe(Effect.orDie);

      if (row?.status === status) {
        return;
      }

      yield* Effect.sleep("20 millis");
    }

    return yield* Effect.die(
      new Error(`timed out waiting for post_ots ${postId} to be ${status}`),
    );
  });

const findUpgradeQueue = (stats: ReadonlyArray<QueueStats>) =>
  stats.find((queue) => queue.queueName === opentimestampsUpgradeJob.name);

describe("opentimestamps upgrade job", () => {
  it.effect(
    "upgrades, verifies, uploads the proof to Arweave and records Bitcoin info",
    () => {
      const uploads: Array<ArweaveUploadOptions> = [];

      return Effect.gen(function* () {
        const db = yield* Database;

        yield* seedPostWithPendingProof({ postId: "post-success" });

        yield* processOpenTimestampsUpgradeJob({ postId: "post-success" });

        const [row] = yield* db
          .select()
          .from(postOts)
          .where(eq(postOts.postId, "post-success"));

        expect({
          status: row?.status,
          otsTxId: row?.otsTxId,
          pendingProof: row?.pendingProof,
          bitcoinBlockHeight: row?.bitcoinBlockHeight,
          bitcoinTimestamp: row?.bitcoinTimestamp,
          uploadContentType: uploads[0]?.contentType,
          uploadFile: uploads[0]?.file,
          uploadTags: uploads[0]?.tags,
        }).toStrictEqual({
          status: "UPGRADED",
          otsTxId: "arweave-test-upload-id",
          pendingProof: null,
          bitcoinBlockHeight: OTS_TEST_VERIFICATION.blockHeight,
          bitcoinTimestamp: new Date(OTS_TEST_VERIFICATION.blockTime * 1000),
          uploadContentType: "application/vnd.opentimestamps.ots",
          uploadFile: OTS_TEST_UPGRADED_PROOF,
          uploadTags: [
            { name: "Original-Tx", value: "post-success" },
            { name: "Root-TX", value: "post-success" },
            { name: "Type", value: "opentimestamps" },
          ],
        });
      }).pipe(Effect.provide(makeUpgradeTestLayer({ uploads })));
    },
  );

  it.effect(
    "fails with a retryable error when Bitcoin has not confirmed yet",
    () =>
      Effect.gen(function* () {
        yield* seedPostWithPendingProof({ postId: "post-pending" });

        const exit = yield* Effect.exit(
          processOpenTimestampsUpgradeJob({ postId: "post-pending" }),
        );

        expect(Exit.isFailure(exit)).toBe(true);

        if (Exit.isFailure(exit)) {
          const error = Exit.findErrorOption(exit);

          expect(Option.isSome(error)).toBe(true);

          if (Option.isSome(error)) {
            expect(error.value._tag).toBe("OtsNotAnchoredError");
          }
        }
      }).pipe(
        Effect.provide(
          makeUpgradeTestLayer({
            upgrade: () =>
              Effect.fail(
                new OtsNotAnchoredError({ message: "not anchored yet" }),
              ),
          }),
        ),
      ),
  );

  it.effect(
    "fails fast with a terminal error when the stored proof is invalid",
    () =>
      Effect.gen(function* () {
        yield* seedPostWithPendingProof({ postId: "post-invalid" });

        const exit = yield* Effect.exit(
          processOpenTimestampsUpgradeJob({ postId: "post-invalid" }),
        );

        expect(Exit.isFailure(exit)).toBe(true);

        if (Exit.isFailure(exit)) {
          const error = Exit.findErrorOption(exit);

          expect(Option.isSome(error)).toBe(true);

          if (Option.isSome(error)) {
            expect(error.value._tag).toBe("TerminalJobError");
          }
        }
      }).pipe(
        Effect.provide(
          makeUpgradeTestLayer({
            upgrade: () =>
              Effect.fail(
                new OtsInvalidProofError({
                  message: "invalid proof",
                  cause: new Error("invalid proof"),
                }),
              ),
          }),
        ),
      ),
  );

  it.live(
    "marks the proof as FAILED after exhausting retries when not anchored",
    () => {
      const uploads: Array<ArweaveUploadOptions> = [];

      return Effect.gen(function* () {
        const admin = yield* JobAdminService;

        yield* seedPostWithPendingProof({ postId: "post-exhausted" });
        yield* opentimestampsUpgradeJob.offer(
          { postId: "post-exhausted" },
          { id: "ots-upgrade:post-exhausted" },
        );

        yield* waitForPostOtsStatus("post-exhausted", "FAILED");

        const upgradeStats = findUpgradeQueue(yield* admin.getQueueStats);

        expect({
          failed: upgradeStats?.failed,
          uploads: uploads.length,
        }).toStrictEqual({ failed: 1, uploads: 0 });
      }).pipe(
        Effect.provide(
          makeUpgradeTestLayer({
            enableWorkers: true,
            uploads,
            upgrade: () =>
              Effect.fail(
                new OtsNotAnchoredError({ message: "not anchored yet" }),
              ),
          }),
        ),
      );
    },
  );

  it.live("marks the proof as FAILED immediately on invalid proofs", () => {
    const uploads: Array<ArweaveUploadOptions> = [];

    return Effect.gen(function* () {
      const admin = yield* JobAdminService;

      yield* seedPostWithPendingProof({ postId: "post-terminal" });
      yield* opentimestampsUpgradeJob.offer(
        { postId: "post-terminal" },
        { id: "ots-upgrade:post-terminal" },
      );

      yield* waitForPostOtsStatus("post-terminal", "FAILED");

      const upgradeStats = findUpgradeQueue(yield* admin.getQueueStats);

      expect({
        completed: upgradeStats?.completed,
        failed: upgradeStats?.failed,
        uploads: uploads.length,
      }).toStrictEqual({ completed: 1, failed: 0, uploads: 0 });
    }).pipe(
      Effect.provide(
        makeUpgradeTestLayer({
          enableWorkers: true,
          uploads,
          upgrade: () =>
            Effect.fail(
              new OtsInvalidProofError({
                message: "invalid proof",
                cause: new Error("invalid proof"),
              }),
            ),
        }),
      ),
    );
  });

  it.live("admin can retry a failed upgrade via a re-offered job", () =>
    Effect.gen(function* () {
      const db = yield* Database;
      const admin = yield* JobAdminService;

      yield* seedPostWithPendingProof({
        postId: "post-retry",
        status: "FAILED",
      });

      yield* opentimestampsUpgradeJob.offer(
        { postId: "post-retry" },
        { id: "ots-upgrade:post-retry" },
      );

      yield* waitForPostOtsStatus("post-retry", "UPGRADED");

      const [row] = yield* db
        .select({ otsTxId: postOts.otsTxId })
        .from(postOts)
        .where(eq(postOts.postId, "post-retry"));

      const upgradeStats = findUpgradeQueue(yield* admin.getQueueStats);

      expect({
        otsTxId: row?.otsTxId,
        completed: upgradeStats?.completed,
      }).toStrictEqual({
        otsTxId: "arweave-test-upload-id",
        completed: 1,
      });
    }).pipe(Effect.provide(makeUpgradeTestLayer({ enableWorkers: true }))),
  );
});
