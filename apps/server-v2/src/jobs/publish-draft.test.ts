import { describe, expect, it } from "@effect/vitest";
import { MetadataAttributeType, PostMetadataSchemaId } from "@sigle/sdk";
import { eq } from "drizzle-orm";
import { Deferred, Effect, ErrorReporter, Exit, Layer, Schedule } from "effect";
import { Database } from "@/db";
import { draft, post } from "@/db/schema";
import { makeQueuesTestLayer } from "@/jobs";
import {
  processPublishDraftJob,
  publishDraftJob,
  publishDraftJobId,
} from "@/jobs/publish-draft";
import { JobAdminService } from "@/queue/admin";
import {
  ArweaveService,
  ArweaveUploadError,
  ARWEAVE_TEST_UPLOAD,
  type ArweaveUploadOptions,
} from "@/services/arweave";
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
          });

          yield* processPublishDraftJob({
            draftId: "draft-1",
            userId: user.id,
            authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            signature: "sig-001",
            metadataJson: sampleMetadataJson,
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

          expect({
            id: createdPost.id,
            draftId: createdPost.draftId,
            txId: createdPost.txId,
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
          }).toStrictEqual({
            id: "arweave-tx-001",
            draftId: "draft-1",
            txId: "arweave-tx-001",
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
          });

          expect(uploads).toHaveLength(1);
          expect(uploads[0]?.tags).toStrictEqual([
            {
              name: "Author",
              value: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            },
          ]);

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
    "skips Arweave upload when draft.txId is already checkpointed from a previous attempt",
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
            txId: "existing-arweave-tx",
            txStatus: "PROCESSING",
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
          expect(createdPost.txId).toBe("existing-arweave-tx");
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
          });

          yield* publishDraftJob.offer(
            {
              draftId: "draft-fail",
              userId: user.id,
              authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
              signature: "sig-fail",
              metadataJson: sampleMetadataJson,
            },
            { id: publishDraftJobId("draft-fail") },
          );

          yield* Deferred.await(done);
          yield* Effect.sleep("40 millis");

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
        ErrorReporter.layer([reporter]),
      );

      const fullLayer = makeQueuesTestLayer({
        pollInterval: "15 millis",
        retrySchedule: Schedule.spaced("0 millis"),
        maxAttempts: 3,
      }).pipe(Layer.provideMerge(baseLayer));

      yield* Effect.gen(function* () {
        const db = yield* Database;
        const admin = yield* JobAdminService;
        const user = yield* createTestUser();

        yield* createTestDraft({
          id: "draft-invalid",
          userId: user.id,
          txStatus: "PENDING",
        });

        yield* publishDraftJob.offer(
          {
            draftId: "draft-invalid",
            userId: user.id,
            authorAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            signature: "sig-invalid",
            metadataJson: "{ not json",
          },
          { id: publishDraftJobId("draft-invalid") },
        );

        yield* Deferred.await(done);
        yield* Effect.sleep("40 millis");

        const [preservedDraft] = yield* db
          .select()
          .from(draft)
          .where(eq(draft.id, "draft-invalid"));

        const stats = yield* admin.getQueueStats;

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
