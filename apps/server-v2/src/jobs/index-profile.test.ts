import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schedule, Schema } from "effect";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { mediaImage, profile, walletAddress } from "@/db/schema";
import { makeQueuesTestLayer } from "@/jobs";
import { generateImageThumbhashJob } from "@/jobs/generate-image-thumbhash";
import {
  type IndexProfileJob,
  processIndexProfileJob,
} from "@/jobs/index-profile";
import { JobAdminService, type QueueStats } from "@/queue/admin";
import { ArweaveService } from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import { MediaImagesService } from "@/services/media-images";
import { MetadataService } from "@/services/metadata";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import { UserProvisioningService } from "@/services/user-provisioning";
import {
  createSignedTestProfileMetadata,
  createTestProfile,
  createTestSiwsCredentials,
  createTestUser,
  createTestWalletAddress,
} from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";

const credentials = createTestSiwsCredentials("testnet");

const toJson = <T>(value: T): Schema.Json => JSON.parse(JSON.stringify(value));

const makeTestLayer = (respond: (url: string) => Schema.Json) =>
  Layer.mergeAll(
    MetadataService.layerTest(respond),
    UserProvisioningService.layer,
    MediaImagesService.layer,
    makeQueuesTestLayer({
      enableWorkers: false,
      maxAttempts: 1,
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

const signedMetadata = (
  overrides: Partial<
    Parameters<typeof createSignedTestProfileMetadata>[0]
  > = {},
) =>
  createSignedTestProfileMetadata({
    privateKey: credentials.privateKey,
    ...overrides,
  });

const makeJob = (
  overrides: Partial<IndexProfileJob> = {},
): IndexProfileJob => ({
  txId: "tx-1",
  blockHeight: 10,
  blockTimestamp: 1_700_000_000,
  uri: "ar://tx-1",
  ...overrides,
});

const findProfile = (userId: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [row] = yield* db
      .select()
      .from(profile)
      .where(eq(profile.userId, userId))
      .limit(1)
      .pipe(Effect.orDie);

    return row;
  });

const findWallet = (address: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [row] = yield* db
      .select()
      .from(walletAddress)
      .where(eq(walletAddress.address, address))
      .limit(1)
      .pipe(Effect.orDie);

    return row;
  });

describe("index profile job", () => {
  it.effect("creates the profile and the author wallet", () => {
    const signed = signedMetadata({ displayName: "Leo" });

    return Effect.gen(function* () {
      yield* processIndexProfileJob(makeJob());

      const wallet = yield* findWallet(credentials.address);
      const created = yield* findProfile(wallet?.userId ?? "");

      expect({
        walletUserId: wallet?.userId,
        userId: created?.userId,
        walletAddressId: created?.walletAddressId,
        arweaveTxId: created?.arweaveTxId,
        signature: created?.signature,
        arweaveBlockHeight: created?.arweaveBlockHeight,
        displayName: created?.displayName,
        picture: created?.picture,
        coverPicture: created?.coverPicture,
      }).toStrictEqual({
        walletUserId: created?.userId,
        userId: created?.userId,
        walletAddressId: wallet?.id,
        arweaveTxId: "tx-1",
        signature: signed.signature,
        arweaveBlockHeight: 10,
        displayName: "Leo",
        picture: null,
        coverPicture: null,
      });
    }).pipe(Effect.provide(makeTestLayer(() => toJson(signed))));
  });

  it.effect("fills the block height of a profile stored on upload", () => {
    const signed = signedMetadata({ displayName: "Updated" });

    return Effect.gen(function* () {
      const user = yield* createTestUser();

      const wallet = yield* createTestWalletAddress({
        userId: user.id,
        address: credentials.address,
      });

      yield* createTestProfile({
        userId: user.id,
        walletAddressId: wallet.id,
        arweaveTxId: "tx-1",
        signature: "own-upload-signature",
        arweaveBlockHeight: null,
        displayName: "Stored on upload",
      });

      yield* processIndexProfileJob(makeJob());

      const updated = yield* findProfile(user.id);

      expect({
        userId: updated?.userId,
        arweaveTxId: updated?.arweaveTxId,
        signature: updated?.signature,
        arweaveBlockHeight: updated?.arweaveBlockHeight,
        displayName: updated?.displayName,
      }).toStrictEqual({
        userId: user.id,
        arweaveTxId: "tx-1",
        signature: signed.signature,
        arweaveBlockHeight: 10,
        displayName: "Updated",
      });
    }).pipe(Effect.provide(makeTestLayer(() => toJson(signed))));
  });

  it.effect("skips a replayed signature under another transaction", () => {
    const signed = signedMetadata({ displayName: "Leo" });

    return Effect.gen(function* () {
      yield* processIndexProfileJob(makeJob());
      yield* processIndexProfileJob(
        makeJob({
          txId: "tx-replay",
          blockHeight: 20,
          uri: "ar://tx-replay",
        }),
      );

      const wallet = yield* findWallet(credentials.address);
      const found = yield* findProfile(wallet?.userId ?? "");

      expect(found?.arweaveTxId).toBe("tx-1");
    }).pipe(Effect.provide(makeTestLayer(() => toJson(signed))));
  });

  it.effect("skips an older revision of a profile", () => {
    const first = signedMetadata({ displayName: "First" });
    const older = signedMetadata({ displayName: "Older" });

    let call = 0;

    return Effect.gen(function* () {
      yield* processIndexProfileJob(makeJob({ blockHeight: 20 }));
      yield* processIndexProfileJob(
        makeJob({
          txId: "tx-old",
          blockHeight: 10,
          uri: "ar://tx-old",
        }),
      );

      const wallet = yield* findWallet(credentials.address);
      const found = yield* findProfile(wallet?.userId ?? "");

      expect({
        arweaveTxId: found?.arweaveTxId,
        arweaveBlockHeight: found?.arweaveBlockHeight,
        displayName: found?.displayName,
      }).toStrictEqual({
        arweaveTxId: "tx-1",
        arweaveBlockHeight: 20,
        displayName: "First",
      });
    }).pipe(
      Effect.provide(
        makeTestLayer(() => {
          call += 1;

          return toJson(call === 1 ? first : older);
        }),
      ),
    );
  });

  it.effect("creates media rows and schedules their thumbhash", () => {
    const signed = signedMetadata({
      displayName: "Leo",
      picture: "https://cdn.test/picture.png",
      coverPicture: "https://cdn.test/cover.png",
    });

    return Effect.gen(function* () {
      yield* processIndexProfileJob(makeJob());

      const db = yield* Database;
      const admin = yield* JobAdminService;

      const images = yield* db
        .select()
        .from(mediaImage)
        .orderBy(mediaImage.id)
        .pipe(Effect.orDie);

      const queue = (yield* admin.getQueueStats).find(
        (stats: QueueStats) =>
          stats.queueName === generateImageThumbhashJob.name,
      );

      expect({
        ids: images.map((image) => [image.id, image.status]),
        pending: queue?.pending,
      }).toStrictEqual({
        ids: [
          ["https://cdn.test/cover.png", "PENDING"],
          ["https://cdn.test/picture.png", "PENDING"],
        ],
        pending: 2,
      });
    }).pipe(Effect.provide(makeTestLayer(() => toJson(signed))));
  });

  it.effect("skips invalid metadata without failing", () => {
    return Effect.gen(function* () {
      yield* processIndexProfileJob(makeJob());

      const db = yield* Database;

      const rows = yield* db.select().from(profile).pipe(Effect.orDie);

      expect(rows).toStrictEqual([]);
    }).pipe(Effect.provide(makeTestLayer(() => ({ hello: "world" }))));
  });
});
