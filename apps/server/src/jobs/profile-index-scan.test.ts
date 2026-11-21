import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Schedule } from "effect";
import { AppConfig } from "@/config";
import { makeQueuesTestLayer } from "@/jobs";
import { JobAdminService } from "@/queue/admin";
import {
  ARWEAVE_TEST_OWNER_ADDRESS,
  ArweaveService,
  type ArweaveTestGateway,
  type ArweaveTransactionsQuery,
} from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import {
  createTestProfile,
  createTestProfileTransaction,
} from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";
import { indexProfileJob, indexProfileJobId } from "./index-profile";
import { scanProfileTransactions } from "./profile-index-scan";

const makeScanTestLayer = (
  gateway: ArweaveTestGateway,
  arweave: Layer.Layer<ArweaveService> = ArweaveService.layerTest(
    [],
    undefined,
    gateway,
  ),
) =>
  makeQueuesTestLayer({
    enableWorkers: false,
    maxAttempts: 2,
    retrySchedule: Schedule.spaced("0 millis"),
  }).pipe(
    Layer.provideMerge(OpenTimestampsService.layerTest()),
    Layer.provideMerge(arweave),
    Layer.provideMerge(PostHogService.layerTest()),
    Layer.provideMerge(AppConfig.layerTest()),
    Layer.provideMerge(ImageProcessingService.layer),
    Layer.provideMerge(TestDatabaseLayer),
  );

const isQueued = (txId: string) =>
  Effect.gen(function* () {
    const admin = yield* JobAdminService;

    const state = yield* admin.getJobState(
      indexProfileJob.name,
      indexProfileJobId(txId),
    );

    return state !== null;
  });

describe("profile index scan", () => {
  it.effect(
    "offers mined profile transactions of our Arweave key that are not confirmed yet",
    () => {
      const queries: Array<ArweaveTransactionsQuery> = [];

      return Effect.gen(function* () {
        yield* createTestProfile({
          address: "SP-CONFIRMED",
          arweaveTxId: "tx-confirmed",
          arweaveBlockHeight: 100,
        });

        yield* createTestProfile({
          address: "SP-PENDING-ROW",
          arweaveTxId: "tx-stored-pending",
        });

        const result = yield* scanProfileTransactions;

        expect({
          result,
          queued: {
            confirmed: yield* isQueued("tx-confirmed"),
            storedPending: yield* isQueued("tx-stored-pending"),
            new: yield* isQueued("tx-new"),
            notMined: yield* isQueued("tx-not-mined"),
            foreign: yield* isQueued("tx-foreign"),
            post: yield* isQueued("tx-post"),
          },
          queries,
        }).toStrictEqual({
          result: { minBlockHeight: 50, offered: 2 },
          queued: {
            confirmed: false,
            storedPending: true,
            new: true,
            notMined: false,
            foreign: false,
            post: false,
          },
          queries: [
            {
              owners: [ARWEAVE_TEST_OWNER_ADDRESS],
              tags: [
                { name: "App-Name", value: "sigle-test" },
                { name: "Type", value: "profile" },
              ],
              minBlockHeight: 50,
              after: undefined,
            },
          ],
        });
      }).pipe(
        Effect.provide(
          makeScanTestLayer({
            queries,
            transactions: [
              createTestProfileTransaction({
                id: "tx-confirmed",
                metadata: {},
                blockHeight: 100,
              }),
              createTestProfileTransaction({
                id: "tx-stored-pending",
                metadata: {},
                blockHeight: 105,
              }),
              createTestProfileTransaction({
                id: "tx-new",
                metadata: {},
                blockHeight: 110,
              }),
              createTestProfileTransaction({
                id: "tx-not-mined",
                metadata: {},
                blockHeight: null,
              }),
              createTestProfileTransaction({
                id: "tx-foreign",
                metadata: {},
                blockHeight: 110,
                ownerAddress: "someone-else",
              }),
              createTestProfileTransaction({
                id: "tx-post",
                metadata: {},
                blockHeight: 110,
                tags: [{ name: "App-Name", value: "sigle-test" }],
              }),
            ],
          }),
        ),
      );
    },
  );

  it.effect("pages through every matching transaction", () => {
    const queries: Array<ArweaveTransactionsQuery> = [];

    return Effect.gen(function* () {
      const result = yield* scanProfileTransactions;

      expect({
        result,
        cursors: queries.map((query) => query.after),
      }).toStrictEqual({
        result: { minBlockHeight: 0, offered: 3 },
        cursors: [undefined, "1", "2"],
      });
    }).pipe(
      Effect.provide(
        makeScanTestLayer({
          queries,
          pageSize: 1,
          transactions: ["tx-1", "tx-2", "tx-3"].map((id, index) =>
            createTestProfileTransaction({
              id,
              metadata: {},
              blockHeight: 10 + index,
            }),
          ),
        }),
      ),
    );
  });

  it.effect("fails when the gateway does not advance the cursor", () => {
    let queries = 0;

    const stuckGateway = Layer.effect(
      ArweaveService,
      Effect.gen(function* () {
        const arweave = yield* ArweaveService;

        return {
          ...arweave,
          queryTransactions: () =>
            Effect.sync(() => {
              queries++;

              return { transactions: [], nextCursor: "stuck" };
            }),
        };
      }),
    ).pipe(Layer.provide(ArweaveService.layerTest()));

    return Effect.gen(function* () {
      const error = yield* scanProfileTransactions.pipe(Effect.flip);

      expect({
        tag: error._tag,
        message: error.message,
        queries,
      }).toStrictEqual({
        tag: "ArweaveGatewayError",
        message: "Arweave GraphQL cursor did not advance: stuck",
        queries: 2,
      });
    }).pipe(Effect.provide(makeScanTestLayer({}, stuckGateway)));
  });
});
