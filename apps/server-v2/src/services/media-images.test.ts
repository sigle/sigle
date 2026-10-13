import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schedule } from "effect";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { mediaImage } from "@/db/schema";
import { makeQueuesTestLayer } from "@/jobs";
import { generateImageThumbhashJob } from "@/jobs/generate-image-thumbhash";
import { JobAdminService, type QueueStats } from "@/queue/admin";
import { ArweaveService } from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import { MediaImagesService } from "@/services/media-images";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import { createTestMediaImage } from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";

const makeTestLayer = () =>
  Layer.merge(
    MediaImagesService.layer,
    makeQueuesTestLayer({
      enableWorkers: false,
      maxAttempts: 2,
      retrySchedule: Schedule.spaced("0 millis"),
    }),
  ).pipe(
    Layer.provideMerge(OpenTimestampsService.layerTest()),
    Layer.provideMerge(ArweaveService.layerTest()),
    Layer.provideMerge(PostHogService.layerTest()),
    Layer.provideMerge(AppConfig.layerTest()),
    Layer.provideMerge(ImageProcessingService.layer),
    Layer.provideMerge(TestDatabaseLayer),
  );

const findMediaImage = (id: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [row] = yield* db
      .select()
      .from(mediaImage)
      .where(eq(mediaImage.id, id))
      .limit(1)
      .pipe(Effect.orDie);

    return row;
  });

const findThumbhashQueue = (stats: ReadonlyArray<QueueStats>) =>
  stats.find((queue) => queue.queueName === generateImageThumbhashJob.name);

describe("media images service", () => {
  it.effect("inserts a pending row and offers the thumbhash job", () =>
    Effect.gen(function* () {
      const media = yield* MediaImagesService;
      const admin = yield* JobAdminService;
      const imageId = "https://cdn.test/cover.png";

      yield* media.ensurePlaceholder(imageId);

      const row = yield* findMediaImage(imageId);
      const queue = findThumbhashQueue(yield* admin.getQueueStats);

      expect({
        status: row?.status,
        thumbhash: row?.thumbhash,
        pending: queue?.pending,
      }).toStrictEqual({
        status: "PENDING",
        thumbhash: null,
        pending: 1,
      });
    }).pipe(Effect.provide(makeTestLayer())),
  );

  it.effect("keeps an existing READY image untouched", () =>
    Effect.gen(function* () {
      const media = yield* MediaImagesService;
      const admin = yield* JobAdminService;
      const imageId = "https://cdn.test/ready.png";

      yield* createTestMediaImage({
        id: imageId,
        status: "READY",
        thumbhash: "existing-thumbhash",
      });

      yield* media.ensurePlaceholder(imageId);

      const row = yield* findMediaImage(imageId);

      expect({
        status: row?.status,
        thumbhash: row?.thumbhash,
        queues: yield* admin.getQueueStats,
      }).toStrictEqual({
        status: "READY",
        thumbhash: "existing-thumbhash",
        queues: [],
      });
    }).pipe(Effect.provide(makeTestLayer())),
  );

  it.effect("does not duplicate the job when called twice", () =>
    Effect.gen(function* () {
      const media = yield* MediaImagesService;
      const admin = yield* JobAdminService;
      const imageId = "https://cdn.test/twice.png";

      yield* media.ensurePlaceholder(imageId);
      yield* media.ensurePlaceholder(imageId);

      const queue = findThumbhashQueue(yield* admin.getQueueStats);

      expect(queue?.pending).toBe(1);
    }).pipe(Effect.provide(makeTestLayer())),
  );
});
