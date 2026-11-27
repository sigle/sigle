import { describe, expect, it } from "@effect/vitest";
import { MetadataAttributeType, PostMetadataSchemaId } from "@sigle/sdk";
import { eq } from "drizzle-orm";
import {
  Deferred,
  Effect,
  ErrorReporter,
  Exit,
  Fiber,
  Layer,
  Schedule,
} from "effect";
import type { ArweaveUploadOptions } from "@/services/arweave";
import type { PostHogEvent } from "@/services/posthog";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { draft, mediaImage, post, postOts } from "@/db/schema";
import { makeQueuesTestLayer } from "@/jobs";
import {
  markDraftPublishFailed,
  processPublishDraftJob,
  publishDraftJob,
} from "@/jobs/publish-draft";
import { sha256Hex } from "@/lib/hash";
import { JobAdminService } from "@/queue/admin";
import {
  ArweaveService,
  ArweaveUploadError,
  ARWEAVE_TEST_UPLOAD,
} from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import { createTestDraft, createTestUser } from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";

const sampleMetadataJson = JSON.stringify({
  $schema: PostMetadataSchemaId.LATEST,
  name: "Post Title",
  content: {
    id: "draft-1",
    title: "Post Title",
    content: "# Hello Sigle",
    excerpt: "Short summary",
    tags: ["web3", "effect"],
    contentWarning: "SENSITIVE",
    coverImage: {
      url: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      type: "image/png",
    },
    attributes: [
      {
        key: "meta-title",
        value: "SEO Title",
        type: MetadataAttributeType.STRING,
      },
      {
        key: "meta-description",
        value: "SEO Description",
        type: MetadataAttributeType.STRING,
      },
      {
        key: "canonical-uri",
        value: "https://sigle.io/p/1",
        type: MetadataAttributeType.STRING,
      },
    ],
  },
  // Jobs carry signed metadata: the publish handler verified the signature.
  signature: "sample-metadata-signature",
});

const waitForDraftStatus = (draftId: string, status: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    for (let attempt = 0; attempt < 200; attempt++) {
      const [row] = yield* db
        .select({ txStatus: draft.txStatus })
        .from(draft)
        .where(eq(draft.id, draftId))
        .limit(1)
        .pipe(Effect.orDie);

      if (row?.txStatus === status) {
        return;
      }

      yield* Effect.sleep("20 millis");
    }

    return yield* Effect.die(
      new Error(`timed out waiting for draft ${draftId} to be ${status}`),
    );
  });

const waitForFailedJobs = (expected: number) =>
  Effect.gen(function* () {
    const admin = yield* JobAdminService;

    for (let attempt = 0; attempt < 200; attempt++) {
      const stats = yield* admin.getQueueStats;

      const queue = stats.find(
        (item) => item.queueName === publishDraftJob.name,
      );

      if ((queue?.failed ?? 0) >= expected) {
        return stats;
      }

      yield* Effect.sleep("20 millis");
    }

    return yield* Effect.die(
      new Error(`timed out waiting for ${expected} failed jobs`),
    );
  });

describe("publishDraftQueue & processPublishDraftJob", () => {
  it.effect(
    "uploads metadata to Arweave, atomically replaces draft with post, and captures PostHog event",
    () =>
      Effect.gen(function* () {
        const uploads: Array<ArweaveUploadOptions> = [];
        const posthogEvents: Array<PostHogEvent> = [];

        const layer = Layer.mergeAll(
          TestDatabaseLayer,
          ArweaveService.layerTest(uploads, () =>
            Effect.succeed({ ...ARWEAVE_TEST_UPLOAD, id: "arweave-tx-001" }),
          ),
          PostHogService.layerTest(posthogEvents),
        );

        yield* Effect.gen(function* () {
          const db = yield* Database;
          const user = yield* createTestUser();
          yield* createTestDraft({
            id: "draft-1",
            userId: user.id,
            title: "Draft Title",
            publishSignature: "sig-001",
          });

          const published = yield* processPublishDraftJob({
            draftId: "draft-1",
            userId: user.id,
            authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            signature: "sig-001",
            metadataJson: sampleMetadataJson,
            generation: 0,
          });

          expect(published).toStrictEqual({
            postId: "arweave-tx-001",
            coverImage:
              "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          });

          const remainingDrafts = yield* db
            .select()
            .from(draft)
            .where(eq(draft.id, "draft-1"));

          expect(remainingDrafts).toStrictEqual([]);

          const [createdPost] = yield* db
            .select()
            .from(post)
            .where(eq(post.id, "arweave-tx-001"));

          const [createdPostOts] = yield* db
            .select()
            .from(postOts)
            .where(eq(postOts.postId, "arweave-tx-001"));

          const [createdMediaImage] = yield* db
            .select()
            .from(mediaImage)
            .where(
              eq(
                mediaImage.id,
                "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
              ),
            );

          expect({
            id: createdPost.id,
            draftId: createdPost.draftId,
            arweaveTxId: createdPost.arweaveTxId,
            arweaveBlockHeight: createdPost.arweaveBlockHeight,
            version: createdPost.version,
            metadataUri: createdPost.metadataUri,
            title: createdPost.title,
            content: createdPost.content,
            excerpt: createdPost.excerpt,
            metaTitle: createdPost.metaTitle,
            metaDescription: createdPost.metaDescription,
            coverImage: createdPost.coverImage,
            tags: createdPost.tags,
            canonicalUri: createdPost.canonicalUri,
            contentWarning: createdPost.contentWarning,
            signature: createdPost.signature,
            userId: createdPost.userId,
            otsStatus: createdPostOts.status,
            otsContentHash: createdPostOts.contentHash,
            mediaStatus: createdMediaImage.status,
            mediaMimeType: createdMediaImage.mimeType,
          }).toStrictEqual({
            id: "arweave-tx-001",
            draftId: "draft-1",
            arweaveTxId: "arweave-tx-001",
            arweaveBlockHeight: null,
            version: "1.0.0",
            metadataUri: "ar://arweave-tx-001",
            title: "Post Title",
            content: "# Hello Sigle",
            excerpt: "Short summary",
            metaTitle: "SEO Title",
            metaDescription: "SEO Description",
            coverImage:
              "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
            tags: ["web3", "effect"],
            canonicalUri: "https://sigle.io/p/1",
            contentWarning: "SENSITIVE",
            signature: "sig-001",
            userId: user.id,
            otsStatus: "PENDING",
            otsContentHash: sha256Hex(Buffer.from(sampleMetadataJson)),
            mediaStatus: "PENDING",
            mediaMimeType: "image/png",
          });

          expect({
            length: uploads.length,
            tags: uploads[0]?.tags,
          }).toStrictEqual({
            length: 1,
            tags: [
              {
                name: "Author",
                value: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
              },
            ],
          });

          expect(posthogEvents).toStrictEqual([
            {
              distinctId: user.id,
              event: "draft published",
              properties: {
                draftId: "draft-1",
                postId: "arweave-tx-001",
                arweaveId: "arweave-tx-001",
              },
            },
          ]);
        }).pipe(Effect.provide(layer));
      }),
  );

  it.effect(
    "skips Arweave upload when draft.arweaveTxId is already checkpointed from a previous attempt",
    () =>
      Effect.gen(function* () {
        const uploads: Array<ArweaveUploadOptions> = [];
        const posthogEvents: Array<PostHogEvent> = [];

        const layer = Layer.mergeAll(
          TestDatabaseLayer,
          ArweaveService.layerTest(uploads),
          PostHogService.layerTest(posthogEvents),
        );

        yield* Effect.gen(function* () {
          const db = yield* Database;
          const user = yield* createTestUser();
          yield* createTestDraft({
            id: "draft-checkpointed",
            userId: user.id,
            arweaveTxId: "existing-arweave-tx",
            txStatus: "PROCESSING",
            publishSignature: "sig-checkpointed",
          });

          yield* processPublishDraftJob({
            draftId: "draft-checkpointed",
            userId: user.id,
            authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            signature: "sig-checkpointed",
            metadataJson: sampleMetadataJson,
            generation: 0,
          });

          expect(uploads).toStrictEqual([]);

          const [createdPost] = yield* db
            .select()
            .from(post)
            .where(eq(post.id, "existing-arweave-tx"));

          expect(createdPost.draftId).toBe("draft-checkpointed");
          expect(createdPost.arweaveTxId).toBe("existing-arweave-tx");
        }).pipe(Effect.provide(layer));
      }),
  );

  it.effect("marks only the current publish generation as failed", () => {
    const posthogEvents: Array<PostHogEvent> = [];

    return Effect.gen(function* () {
      const db = yield* Database;
      const user = yield* createTestUser();

      yield* createTestDraft({
        id: "draft-generation-failed",
        userId: user.id,
        txStatus: "PROCESSING",
        publishSignature: "sig-generation-failed",
        publishGeneration: 2,
      });

      const job = {
        draftId: "draft-generation-failed",
        userId: user.id,
        authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        signature: "sig-generation-failed",
        metadataJson: sampleMetadataJson,
      };

      // The job of an older publish generation: no longer the user's.
      yield* markDraftPublishFailed({ ...job, generation: 1 });

      const [afterOlder] = yield* db
        .select()
        .from(draft)
        .where(eq(draft.id, "draft-generation-failed"));

      const eventsAfterOlder = posthogEvents.length;

      yield* markDraftPublishFailed({ ...job, generation: 2 });

      const [afterCurrent] = yield* db
        .select()
        .from(draft)
        .where(eq(draft.id, "draft-generation-failed"));

      expect({
        olderTxStatus: afterOlder.txStatus,
        eventsAfterOlder,
        currentTxStatus: afterCurrent.txStatus,
        posthogEvents,
      }).toStrictEqual({
        olderTxStatus: "PROCESSING",
        eventsAfterOlder: 0,
        currentTxStatus: "FAILED",
        posthogEvents: [
          {
            distinctId: user.id,
            event: "draft_publish_failed",
            properties: { draftId: "draft-generation-failed" },
          },
        ],
      });
    }).pipe(
      Effect.provide([
        TestDatabaseLayer,
        PostHogService.layerTest(posthogEvents),
      ]),
    );
  });

  it.effect("does nothing when a newer publish generation owns the draft", () =>
    Effect.gen(function* () {
      const uploads: Array<ArweaveUploadOptions> = [];
      const posthogEvents: Array<PostHogEvent> = [];

      const layer = Layer.mergeAll(
        TestDatabaseLayer,
        ArweaveService.layerTest(uploads),
        PostHogService.layerTest(posthogEvents),
      );

      yield* Effect.gen(function* () {
        const db = yield* Database;
        const user = yield* createTestUser();
        yield* createTestDraft({
          id: "draft-superseded",
          userId: user.id,
          txStatus: "PENDING",
          publishSignature: "sig-superseded",
          publishGeneration: 3,
        });

        yield* processPublishDraftJob({
          draftId: "draft-superseded",
          userId: user.id,
          authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          signature: "sig-superseded",
          metadataJson: sampleMetadataJson,
          generation: 2,
        });

        const [preservedDraft] = yield* db
          .select()
          .from(draft)
          .where(eq(draft.id, "draft-superseded"));

        const posts = yield* db
          .select()
          .from(post)
          .where(eq(post.draftId, "draft-superseded"));

        expect({
          uploads: uploads.length,
          posthogEvents: posthogEvents.length,
          txStatus: preservedDraft.txStatus,
          publishSignature: preservedDraft.publishSignature,
          publishGeneration: preservedDraft.publishGeneration,
          arweaveTxId: preservedDraft.arweaveTxId,
          posts: posts.length,
        }).toStrictEqual({
          uploads: 0,
          posthogEvents: 0,
          txStatus: "PENDING",
          publishSignature: "sig-superseded",
          publishGeneration: 3,
          arweaveTxId: null,
          posts: 0,
        });
      }).pipe(Effect.provide(layer));
    }),
  );

  it.effect(
    "runs the upload again when a job is retaken after an interruption",
    () =>
      Effect.gen(function* () {
        const uploads: Array<ArweaveUploadOptions> = [];
        const started = yield* Deferred.make<void>();
        let calls = 0;

        const layer = Layer.mergeAll(
          TestDatabaseLayer,
          ArweaveService.layerTest(uploads, () =>
            Effect.suspend(() => {
              calls++;

              // The first upload hangs until the job is interrupted, like a
              // deploy stopping the worker mid-upload.
              return calls === 1
                ? Deferred.succeed(started, undefined).pipe(
                    Effect.andThen(Effect.never),
                  )
                : Effect.succeed({
                    ...ARWEAVE_TEST_UPLOAD,
                    id: "retaken-arweave-tx",
                  });
            }),
          ),
          PostHogService.layerTest(),
        );

        yield* Effect.gen(function* () {
          const db = yield* Database;
          const user = yield* createTestUser();
          yield* createTestDraft({
            id: "draft-retaken",
            userId: user.id,
            txStatus: "PENDING",
            publishSignature: "sig-retaken",
          });

          const job = {
            draftId: "draft-retaken",
            userId: user.id,
            authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            signature: "sig-retaken",
            metadataJson: sampleMetadataJson,
            generation: 0,
          };

          const interrupted = yield* Effect.forkChild(
            processPublishDraftJob(job),
          );
          yield* Deferred.await(started);
          yield* Fiber.interrupt(interrupted);

          // The queue retakes the interrupted element: nothing on the draft
          // blocks the new attempt.
          const published = yield* processPublishDraftJob(job);

          const posts = yield* db
            .select({ id: post.id })
            .from(post)
            .where(eq(post.draftId, "draft-retaken"));

          expect({
            published: published?.postId,
            posts,
            uploadCalls: calls,
          }).toStrictEqual({
            published: "retaken-arweave-tx",
            posts: [{ id: "retaken-arweave-tx" }],
            uploadCalls: 2,
          });
        }).pipe(Effect.provide(layer));
      }),
  );

  it.live(
    "marks draft as FAILED, preserves draft, and reports to ErrorReporter when all queue attempts fail",
    () =>
      Effect.gen(function* () {
        const reportedMessages: Array<string> = [];
        const done = yield* Deferred.make<void>();
        let attempts = 0;

        const reporter = ErrorReporter.make(({ error }) => {
          reportedMessages.push(error.message);
          Deferred.doneUnsafe(done, Exit.void);
        });

        const baseLayer = Layer.mergeAll(
          TestDatabaseLayer,
          ArweaveService.layerTest([], () => {
            attempts++;

            return Effect.fail(
              new ArweaveUploadError({
                cause: new Error("Arweave gateway down"),
                message: "Arweave gateway down",
              }),
            );
          }),
          PostHogService.layerTest(),
          OpenTimestampsService.layerTest(),
          AppConfig.layerTest(),
          ImageProcessingService.layer,
          ErrorReporter.layer([reporter]),
        );

        const fullLayer = makeQueuesTestLayer({
          pollInterval: "15 millis",
          retrySchedule: Schedule.spaced("0 millis"),
          maxAttempts: 2,
        }).pipe(Layer.provideMerge(baseLayer));

        yield* Effect.gen(function* () {
          const db = yield* Database;
          const user = yield* createTestUser();

          yield* createTestDraft({
            id: "draft-fail",
            userId: user.id,
            txStatus: "PENDING",
            publishSignature: "sig-fail",
          });

          yield* publishDraftJob.offer({
            draftId: "draft-fail",
            userId: user.id,
            authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            signature: "sig-fail",
            metadataJson: sampleMetadataJson,
            generation: 0,
          });

          yield* Deferred.await(done);
          yield* waitForDraftStatus("draft-fail", "FAILED");

          expect(attempts).toBe(2);
          expect(reportedMessages).toStrictEqual(["Arweave gateway down"]);

          const [preservedDraft] = yield* db
            .select()
            .from(draft)
            .where(eq(draft.id, "draft-fail"));

          expect(preservedDraft.txStatus).toBe("FAILED");
        }).pipe(Effect.provide(fullLayer));
      }),
  );

  it.live("fails fast on invalid metadata without uploading or retrying", () =>
    Effect.gen(function* () {
      const reportedMessages: Array<string> = [];
      const done = yield* Deferred.make<void>();
      const uploads: Array<ArweaveUploadOptions> = [];

      const reporter = ErrorReporter.make(({ error }) => {
        reportedMessages.push(error.message);
        Deferred.doneUnsafe(done, Exit.void);
      });

      const baseLayer = Layer.mergeAll(
        TestDatabaseLayer,
        ArweaveService.layerTest(uploads),
        PostHogService.layerTest(),
        OpenTimestampsService.layerTest(),
        AppConfig.layerTest(),
        ImageProcessingService.layer,
        ErrorReporter.layer([reporter]),
      );

      const fullLayer = makeQueuesTestLayer({
        pollInterval: "15 millis",
        retrySchedule: Schedule.spaced("0 millis"),
        maxAttempts: 3,
      }).pipe(Layer.provideMerge(baseLayer));

      yield* Effect.gen(function* () {
        const db = yield* Database;
        const user = yield* createTestUser();

        yield* createTestDraft({
          id: "draft-invalid",
          userId: user.id,
          txStatus: "PENDING",
          publishSignature: "sig-invalid",
        });

        yield* publishDraftJob.offer({
          draftId: "draft-invalid",
          userId: user.id,
          authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          signature: "sig-invalid",
          metadataJson: "{ not json",
          generation: 0,
        });

        yield* Deferred.await(done);
        yield* waitForDraftStatus("draft-invalid", "FAILED");

        const [preservedDraft] = yield* db
          .select()
          .from(draft)
          .where(eq(draft.id, "draft-invalid"));

        const stats = yield* waitForFailedJobs(1);

        expect({
          reported: reportedMessages.length,
          uploads: uploads.length,
          txStatus: preservedDraft.txStatus,
          completed: stats[0]?.completed,
          failed: stats[0]?.failed,
        }).toStrictEqual({
          reported: 1,
          uploads: 0,
          txStatus: "FAILED",
          completed: 0,
          failed: 1,
        });
      }).pipe(Effect.provide(fullLayer));
    }),
  );
});
