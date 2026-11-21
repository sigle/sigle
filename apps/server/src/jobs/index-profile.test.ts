import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schedule } from "effect";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { mediaImage, profile } from "@/db/schema";
import { makeQueuesTestLayer } from "@/jobs";
import {
  ArweaveService,
  type ArweaveTestTransaction,
} from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import {
  createSignedTestProfileMetadata,
  createTestProfile,
  createTestProfileTransaction,
  createTestSiwsCredentials,
} from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";
import { processIndexProfileJob } from "./index-profile";

const makeIndexTestLayer = (
  transactions: ReadonlyArray<ArweaveTestTransaction> = [],
) =>
  makeQueuesTestLayer({
    enableWorkers: false,
    maxAttempts: 2,
    retrySchedule: Schedule.spaced("0 millis"),
  }).pipe(
    Layer.provideMerge(OpenTimestampsService.layerTest()),
    Layer.provideMerge(
      ArweaveService.layerTest([], undefined, { transactions }),
    ),
    Layer.provideMerge(PostHogService.layerTest()),
    Layer.provideMerge(AppConfig.layerTest()),
    Layer.provideMerge(ImageProcessingService.layer),
    Layer.provideMerge(TestDatabaseLayer),
  );

const findProfile = (address: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [row] = yield* db
      .select({
        arweaveTxId: profile.arweaveTxId,
        arweaveBlockHeight: profile.arweaveBlockHeight,
        displayName: profile.displayName,
      })
      .from(profile)
      .where(eq(profile.address, address))
      .pipe(Effect.orDie);

    return row;
  });

const credentials = createTestSiwsCredentials();

const indexedMetadata = createSignedTestProfileMetadata({
  privateKey: credentials.privateKey,
  id: "profile-indexed",
  displayName: "Indexed",
  picture: "https://cdn.test/indexed.png",
});

const indexedTransaction = createTestProfileTransaction({
  id: "tx-indexed",
  metadata: indexedMetadata,
  blockHeight: 120,
});

describe("index profile job", () => {
  it.effect(
    "stores the profile of a signer without an account and schedules its picture",
    () =>
      Effect.gen(function* () {
        const db = yield* Database;

        const outcome = yield* processIndexProfileJob({
          txId: "tx-indexed",
          blockHeight: 120,
        });

        const [picture] = yield* db
          .select({ status: mediaImage.status })
          .from(mediaImage)
          .where(eq(mediaImage.id, "https://cdn.test/indexed.png"))
          .pipe(Effect.orDie);

        expect({
          outcome,
          profile: yield* findProfile(credentials.address),
          picture,
        }).toStrictEqual({
          outcome: "indexed",
          profile: {
            arweaveTxId: "tx-indexed",
            arweaveBlockHeight: 120,
            displayName: "Indexed",
          },
          picture: { status: "PENDING" },
        });
      }).pipe(Effect.provide(makeIndexTestLayer([indexedTransaction]))),
  );

  it.effect(
    "sets the block of the stored transaction without fetching it",
    () =>
      Effect.gen(function* () {
        yield* createTestProfile({
          address: credentials.address,
          arweaveTxId: "tx-stored",
          displayName: "Stored",
        });

        // The gateway serves nothing, so fetching the data would fail.
        const outcome = yield* processIndexProfileJob({
          txId: "tx-stored",
          blockHeight: 130,
        });

        expect({
          outcome,
          profile: yield* findProfile(credentials.address),
        }).toStrictEqual({
          outcome: "confirmed",
          profile: {
            arweaveTxId: "tx-stored",
            arweaveBlockHeight: 130,
            displayName: "Stored",
          },
        });
      }).pipe(Effect.provide(makeIndexTestLayer())),
  );

  it.effect("keeps a stored profile that is not mined yet", () =>
    Effect.gen(function* () {
      yield* createTestProfile({
        address: credentials.address,
        arweaveTxId: "tx-pending",
        displayName: "Pending",
      });

      const outcome = yield* processIndexProfileJob({
        txId: "tx-indexed",
        blockHeight: 120,
      });

      expect({
        outcome,
        profile: yield* findProfile(credentials.address),
      }).toStrictEqual({
        outcome: "superseded",
        profile: {
          arweaveTxId: "tx-pending",
          arweaveBlockHeight: null,
          displayName: "Pending",
        },
      });
    }).pipe(Effect.provide(makeIndexTestLayer([indexedTransaction]))),
  );

  it.effect("keeps a stored profile mined in the same block", () =>
    Effect.gen(function* () {
      yield* createTestProfile({
        address: credentials.address,
        arweaveTxId: "tx-stored",
        arweaveBlockHeight: 120,
        displayName: "Stored",
      });

      const outcome = yield* processIndexProfileJob({
        txId: "tx-indexed",
        blockHeight: 120,
      });

      expect({
        outcome,
        profile: yield* findProfile(credentials.address),
      }).toStrictEqual({
        outcome: "superseded",
        profile: {
          arweaveTxId: "tx-stored",
          arweaveBlockHeight: 120,
          displayName: "Stored",
        },
      });
    }).pipe(Effect.provide(makeIndexTestLayer([indexedTransaction]))),
  );

  it.effect("replaces a stored profile mined in a lower block", () =>
    Effect.gen(function* () {
      yield* createTestProfile({
        address: credentials.address,
        arweaveTxId: "tx-stored",
        arweaveBlockHeight: 119,
        displayName: "Stored",
      });

      const outcome = yield* processIndexProfileJob({
        txId: "tx-indexed",
        blockHeight: 120,
      });

      expect({
        outcome,
        profile: yield* findProfile(credentials.address),
      }).toStrictEqual({
        outcome: "indexed",
        profile: {
          arweaveTxId: "tx-indexed",
          arweaveBlockHeight: 120,
          displayName: "Indexed",
        },
      });
    }).pipe(Effect.provide(makeIndexTestLayer([indexedTransaction]))),
  );

  it.effect(
    "skips metadata whose signature is stored under another transaction",
    () =>
      Effect.gen(function* () {
        yield* createTestProfile({
          address: credentials.address,
          arweaveTxId: "tx-original",
          arweaveBlockHeight: 100,
          signature: indexedMetadata.signature,
          displayName: "Indexed",
        });

        const outcome = yield* processIndexProfileJob({
          txId: "tx-indexed",
          blockHeight: 120,
        });

        expect({
          outcome,
          profile: yield* findProfile(credentials.address),
        }).toStrictEqual({
          outcome: "replayed",
          profile: {
            arweaveTxId: "tx-original",
            arweaveBlockHeight: 100,
            displayName: "Indexed",
          },
        });
      }).pipe(Effect.provide(makeIndexTestLayer([indexedTransaction]))),
  );

  it.effect("fails terminally on unsigned metadata", () => {
    const { signature: _, ...unsignedMetadata } = indexedMetadata;

    return Effect.gen(function* () {
      const error = yield* processIndexProfileJob({
        txId: "tx-unsigned",
        blockHeight: 120,
      }).pipe(Effect.flip);

      expect({
        error: error._tag,
        profile: yield* findProfile(credentials.address),
      }).toStrictEqual({ error: "TerminalJobError", profile: undefined });
    }).pipe(
      Effect.provide(
        makeIndexTestLayer([
          createTestProfileTransaction({
            id: "tx-unsigned",
            metadata: unsignedMetadata,
            blockHeight: 120,
          }),
        ]),
      ),
    );
  });
});
