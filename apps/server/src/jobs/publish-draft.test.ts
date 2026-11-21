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
  type ArweaveUploadOptions,
} from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService, type PostHogEvent } from "@/services/posthog";
import { createTestDraft, createTestUser } from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";

const sampleMetadataJson = JSON.stringify({
  $schema: PostMetadataSchemaId.LATEST,
  name: "Post Title",
  content: {
    id: "draft-1",
    title: "Post Title",
    content: "# Hello Sigle",
    tags: ["web3", "effect"],
    coverImage: {
      url: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      type: "image/png",
    },
    attributes: [
      {
        key: "excerpt",
        value: "Short summary",
        type: MetadataAttributeType.STRING,
      },
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

const waitForCompletedJobs = (expected: number) =>
  Effect.gen(function* () {
    const admin = yield* JobAdminService;

    for (let attempt = 0; attempt < 200; attempt++) {
      const stats = yield* admin.getQueueStats;

      const queue = stats.find(
        (item) => item.queueName === publishDraftJob.name,
      );

      if ((queue?.completed ?? 0) >= expected) {
        return stats;
      }

      yield* Effect.sleep("20 millis");
    }

    return yield* Effect.die(
      new Error(`timed out waiting for ${expected} completed jobs`),
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

  it.effect(
    "elects one uploader when concurrent same-signature workers race",
    () =>
      Effect.gen(function* () {
        const uploads: Array<ArweaveUploadOptions> = [];
        const uploadStarted = yield* Deferred.make<void>();
        const releaseUpload = yield* Deferred.make<void>();

        const layer = Layer.mergeAll(
          TestDatabaseLayer,
          ArweaveService.layerTest(uploads, () =>
            Effect.gen(function* () {
              yield* Deferred.succeed(uploadStarted, undefined);
              yield* Deferred.await(releaseUpload);

              return { ...ARWEAVE_TEST_UPLOAD, id: "concurrent-arweave-tx" };
            }),
          ),
          PostHogService.layerTest(),
        );

        yield* Effect.gen(function* () {
          const db = yield* Database;
          const user = yield* createTestUser();
          yield* createTestDraft({
            id: "draft-concurrent",
            userId: user.id,
            publishSignature: "sig-concurrent",
          });

          const job = {
            draftId: "draft-concurrent",
            userId: user.id,
            authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            signature: "sig-concurrent",
            metadataJson: sampleMetadataJson,
          };

          const first = yield* Effect.forkChild(processPublishDraftJob(job));
          yield* Deferred.await(uploadStarted);

          // The second worker cannot claim the in-flight upload.
          const second = yield* Effect.exit(processPublishDraftJob(job));

          expect(Exit.isFailure(second)).toBe(true);
          expect(uploads).toHaveLength(1);

          yield* Deferred.succeed(releaseUpload, undefined);
          yield* Fiber.join(first);

          const posts = yield* db
            .select()
            .from(post)
            .where(eq(post.draftId, "draft-concurrent"));

          expect({
            uploads: uploads.length,
            postIds: posts.map((item) => item.id),
          }).toStrictEqual({
            uploads: 1,
            postIds: ["concurrent-arweave-tx"],
          });
        }).pipe(Effect.provide(layer));
      }),
  );

  it.effect("reclaims an upload claim whose lease expired", () =>
    Effect.gen(function* () {
      const uploads: Array<ArweaveUploadOptions> = [];

      const layer = Layer.mergeAll(
        TestDatabaseLayer,
        ArweaveService.layerTest(uploads, () =>
          Effect.succeed({
            ...ARWEAVE_TEST_UPLOAD,
            id: "reclaimed-arweave-tx",
          }),
        ),
        PostHogService.layerTest(),
      );

      yield* Effect.gen(function* () {
        const db = yield* Database;
        const user = yield* createTestUser();
        yield* createTestDraft({
          id: "draft-reclaim",
          userId: user.id,
          publishSignature: "sig-reclaim",
          uploadClaimedAt: new Date(Date.now() - 10 * 60 * 1000),
        });

        yield* processPublishDraftJob({
          draftId: "draft-reclaim",
          userId: user.id,
          authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          signature: "sig-reclaim",
          metadataJson: sampleMetadataJson,
        });

        const [createdPost] = yield* db
          .select()
          .from(post)
          .where(eq(post.draftId, "draft-reclaim"));

        expect({
          uploads: uploads.length,
          postId: createdPost.id,
        }).toStrictEqual({
          uploads: 1,
          postId: "reclaimed-arweave-tx",
        });
      }).pipe(Effect.provide(layer));
    }),
  );

  it.effect(
    "does not release an active upload claim when marking failure",
    () =>
      Effect.gen(function* () {
        const db = yield* Database;
        const user = yield* createTestUser();
        const claimedAt = new Date();

        yield* createTestDraft({
          id: "draft-claim-failed",
          userId: user.id,
          txStatus: "PROCESSING",
          publishSignature: "sig-claim-failed",
          uploadClaimedAt: claimedAt,
        });

        yield* markDraftPublishFailed({
          draftId: "draft-claim-failed",
          userId: user.id,
          authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          signature: "sig-claim-failed",
          metadataJson: sampleMetadataJson,
        });

        const [failedDraft] = yield* db
          .select()
          .from(draft)
          .where(eq(draft.id, "draft-claim-failed"));

        expect({
          txStatus: failedDraft.txStatus,
          uploadClaimedAt: failedDraft.uploadClaimedAt,
        }).toStrictEqual({
          txStatus: "FAILED",
          uploadClaimedAt: claimedAt,
        });
      }).pipe(Effect.provide(TestDatabaseLayer)),
  );

  it.effect("does nothing when a newer publish owns the draft", () =>
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
          publishSignature: "newer-signature",
        });

        yield* processPublishDraftJob({
          draftId: "draft-superseded",
          userId: user.id,
          authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          signature: "older-signature",
          metadataJson: sampleMetadataJson,
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
          posts: posts.length,
        }).toStrictEqual({
          uploads: 0,
          posthogEvents: 0,
          txStatus: "PENDING",
          publishSignature: "newer-signature",
          posts: 0,
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
        });

        yield* Deferred.await(done);
        yield* waitForDraftStatus("draft-invalid", "FAILED");

        const [preservedDraft] = yield* db
          .select()
          .from(draft)
          .where(eq(draft.id, "draft-invalid"));

        const stats = yield* waitForCompletedJobs(1);

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
          completed: 1,
          failed: 0,
        });
      }).pipe(Effect.provide(fullLayer));
    }),
  );
});
