import { eq } from "drizzle-orm";
import { Effect, Layer, Schedule, Schema } from "effect";
import { Database } from "@/db";
import { postOts } from "@/db/schema";
import { defineJob, type JobQueue } from "@/queue/core";
import {
  OpenTimestampsService,
  type OtsStampError,
} from "@/services/opentimestamps";
import {
  opentimestampsUpgradeJob,
  OpenTimestampsUpgradeJobSchema,
} from "./opentimestamps-upgrade";

export const OPENTIMESTAMPS_STAMP_QUEUE_NAME = "opentimestamps-stamp";

export const OPENTIMESTAMPS_STAMP_MAX_ATTEMPTS = 3;

export const OpenTimestampsStampJobSchema = Schema.Struct({
  postId: Schema.String,
});

export type OpenTimestampsStampJob = typeof OpenTimestampsStampJobSchema.Type;

export const otsStampJobId = (postId: string): string => `ots-stamp:${postId}`;

export const otsUpgradeJobId = (postId: string): string =>
  `ots-upgrade:${postId}`;

export const processOpenTimestampsStampJob = (
  job: OpenTimestampsStampJob,
): Effect.Effect<
  void,
  OtsStampError,
  | Database
  | OpenTimestampsService
  | JobQueue<typeof OpenTimestampsUpgradeJobSchema>
> =>
  Effect.gen(function* () {
    const db = yield* Database;
    const ots = yield* OpenTimestampsService;

    const [postOtsRow] = yield* db
      .select({
        status: postOts.status,
        contentHash: postOts.contentHash,
        pendingProof: postOts.pendingProof,
      })
      .from(postOts)
      .where(eq(postOts.postId, job.postId))
      .limit(1)
      .pipe(Effect.orDie);

    if (!postOtsRow || postOtsRow.status === "UPGRADED") {
      return;
    }

    // A pending proof already exists (e.g. this job was retried after the
    // upgrade offer failed): make sure the upgrade is scheduled.
    if (postOtsRow.pendingProof === null) {
      const proof = yield* ots.stamp(postOtsRow.contentHash);

      yield* db
        .update(postOts)
        .set({
          status: "PENDING",
          pendingProof: proof,
          updatedAt: new Date(),
        })
        .where(eq(postOts.postId, job.postId))
        .pipe(Effect.orDie);
    }

    yield* opentimestampsUpgradeJob
      .offer({ postId: job.postId }, { id: otsUpgradeJobId(job.postId) })
      .pipe(Effect.orDie);
  });

export const markOpenTimestampsStampFailed = (
  job: OpenTimestampsStampJob,
): Effect.Effect<void, never, Database> =>
  Effect.gen(function* () {
    const db = yield* Database;

    yield* db
      .update(postOts)
      .set({ status: "FAILED", updatedAt: new Date() })
      .where(eq(postOts.postId, job.postId))
      .pipe(
        Effect.retry({
          schedule: Schedule.exponential("100 millis"),
          times: 3,
        }),
        Effect.catchCause((cause) =>
          Effect.logError(
            `Failed to mark post ${job.postId} OpenTimestamps stamp as FAILED`,
            cause,
          ),
        ),
      );
  });

export const opentimestampsStampJob = defineJob({
  name: OPENTIMESTAMPS_STAMP_QUEUE_NAME,
  payload: OpenTimestampsStampJobSchema,
  maxAttempts: OPENTIMESTAMPS_STAMP_MAX_ATTEMPTS,
  concurrency: 2,
  process: (job) => processOpenTimestampsStampJob(job),
  onFinalFailure: (job) => markOpenTimestampsStampFailed(job),
  reportPayload: (job) => ({ postId: job.postId }),
});

export const OpenTimestampsStampWorkerLive = opentimestampsStampJob
  .workerLayer()
  .pipe(
    Layer.provideMerge(opentimestampsStampJob.layer),
    Layer.provideMerge(opentimestampsUpgradeJob.layer),
  );
