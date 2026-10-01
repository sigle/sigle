import { PostMetadataSchema } from "@sigle/sdk";
import { and, eq } from "drizzle-orm";
import { Data, Effect, Layer, Schedule, Schema } from "effect";
import { Database } from "@/db";
import { draft, post } from "@/db/schema";
import { defineJob, terminal, type TerminalJobError } from "@/queue/core";
import { ArweaveService, type ArweaveUploadError } from "@/services/arweave";
import { PostHogService } from "@/services/posthog";

export const PUBLISH_DRAFT_QUEUE_NAME = "publish-draft";

export const PUBLISH_DRAFT_MAX_ATTEMPTS = 3;

export const publishDraftJobId = (draftId: string): string =>
  `${PUBLISH_DRAFT_QUEUE_NAME}:${draftId}`;

export const PublishDraftJobSchema = Schema.Struct({
  draftId: Schema.String,
  userId: Schema.String,
  authorAddress: Schema.String,
  signature: Schema.String,
  metadataJson: Schema.String,
});

export type PublishDraftJob = typeof PublishDraftJobSchema.Type;

class InvalidPublishMetadataError extends Data.TaggedError(
  "InvalidPublishMetadataError",
)<{
  readonly message: string;
  readonly cause: unknown;
}> {}

const publishDraftRetrySchedule: Schedule.Schedule<unknown, number> =
  Schedule.jittered(
    Schedule.min([
      Schedule.exponential("5 seconds"),
      Schedule.spaced("2 minutes"),
    ]),
  );

export const processPublishDraftJob = (
  job: PublishDraftJob,
): Effect.Effect<
  void,
  ArweaveUploadError | TerminalJobError,
  Database | ArweaveService | PostHogService
> =>
  Effect.gen(function* () {
    const db = yield* Database;
    const arweave = yield* ArweaveService;
    const posthog = yield* PostHogService;

    const [foundDraft] = yield* db
      .select({
        id: draft.id,
        txId: draft.txId,
      })
      .from(draft)
      .where(and(eq(draft.id, job.draftId), eq(draft.userId, job.userId)))
      .limit(1)
      .pipe(Effect.orDie);

    if (!foundDraft) {
      return;
    }

    const postData = yield* Effect.try({
      try: () => PostMetadataSchema.parse(JSON.parse(job.metadataJson)),
      catch: (cause) =>
        terminal(
          new InvalidPublishMetadataError({
            message: cause instanceof Error ? cause.message : String(cause),
            cause,
          }),
        ),
    });

    // Step 1: Upload metadata JSON to Arweave (or reuse checkpointed txId from
    // an earlier attempt if a downstream step failed and triggered a retry).
    const arweaveId =
      foundDraft.txId ??
      (yield* Effect.gen(function* () {
        const uploaded = yield* arweave.uploadFile({
          file: Buffer.from(job.metadataJson),
          contentType: "application/json",
          tags: [
            {
              name: "Author",
              value: job.authorAddress,
            },
          ],
        });

        yield* db
          .update(draft)
          .set({
            txId: uploaded.id,
            txStatus: "PROCESSING",
            updatedAt: new Date(),
          })
          .where(and(eq(draft.id, job.draftId), eq(draft.userId, job.userId)))
          .pipe(Effect.orDie);

        return uploaded.id;
      }));

    const attributes = postData.content.attributes ?? [];

    const findAttribute = (key: string): string | undefined =>
      attributes.find((attribute) => attribute.key === key)?.value;

    const metaTitle = findAttribute("meta-title") ?? null;
    const metaDescription = findAttribute("meta-description") ?? null;
    const excerpt = findAttribute("excerpt") ?? "";
    const canonicalUri = findAttribute("canonical-uri") ?? null;
    const coverImage = postData.content.coverImage?.url ?? null;

    const versionSplit = postData.$schema.split("/");
    const version = (versionSplit.at(-1) ?? "1.0.0").replace(".json", "");

    // Step 2: Atomically delete the draft and insert the published post.
    const finalized = yield* db
      .transaction((tx) =>
        Effect.gen(function* () {
          const [deletedDraft] = yield* tx
            .delete(draft)
            .where(and(eq(draft.id, job.draftId), eq(draft.userId, job.userId)))
            .returning({ id: draft.id });

          if (!deletedDraft) {
            return false;
          }

          yield* tx.insert(post).values({
            id: arweaveId,
            draftId: job.draftId,
            version,
            arweaveId,
            metadataUri: `ar://${arweaveId}`,
            title: postData.content.title,
            content: postData.content.content,
            excerpt,
            metaTitle,
            metaDescription,
            coverImage,
            tags: postData.content.tags ?? [],
            canonicalUri,
            signature: job.signature,
            userId: job.userId,
          });

          return true;
        }),
      )
      .pipe(Effect.orDie);

    if (!finalized) {
      return;
    }

    yield* posthog.capture({
      distinctId: job.userId,
      event: "draft published",
      properties: {
        draftId: job.draftId,
        postId: arweaveId,
        arweaveId,
      },
    });
  });

export const markDraftPublishFailed = (
  job: PublishDraftJob,
): Effect.Effect<void, never, Database> =>
  Effect.gen(function* () {
    const db = yield* Database;
    yield* db
      .update(draft)
      .set({
        txStatus: "FAILED",
        updatedAt: new Date(),
      })
      .where(and(eq(draft.id, job.draftId), eq(draft.userId, job.userId)))
      .pipe(Effect.ignore);
  });

export const publishDraftJob = defineJob({
  name: PUBLISH_DRAFT_QUEUE_NAME,
  payload: PublishDraftJobSchema,
  maxAttempts: PUBLISH_DRAFT_MAX_ATTEMPTS,
  retrySchedule: publishDraftRetrySchedule,
  concurrency: 2,
  process: (job) => processPublishDraftJob(job),
  onFinalFailure: (job) => markDraftPublishFailed(job),
  reportPayload: (job) => ({ draftId: job.draftId }),
});

export const PublishDraftWorkerLive = publishDraftJob
  .workerLayer()
  .pipe(Layer.provideMerge(publishDraftJob.layer));
