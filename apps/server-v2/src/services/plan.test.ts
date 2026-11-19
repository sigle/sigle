import { describe, expect, it } from "@effect/vitest";
import { TEG_NFT_ASSET_IDENTIFIER } from "@sigle/sdk";
import { Effect, Layer } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import { AppConfig, type AppConfigValues } from "@/config";
import {
  makePlanService,
  NftHoldingsError,
  PlanService,
} from "@/services/plan";
import { createTestUser, createTestWalletAddress } from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";

const HOLDER = "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE";

const NON_HOLDER = "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7";

const OTHER_NON_HOLDER = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";

const MAINNET_CONFIG: Partial<AppConfigValues> = {
  STACKS_ENV: "mainnet",
  STACKS_API_URL: "https://stacks-api.test/",
};

/** Stacks API answering NFT balance requests with the totals in `holdings`. */
const makeStacksApiLayer = (
  holdings: Readonly<Record<string, number>>,
  requests: Array<URL> = [],
  status = 200,
) =>
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request, url) =>
      Effect.sync(() => {
        requests.push(url);

        const principal =
          /^\/extended\/v3\/principals\/([^/]+)\/balances\/nft$/.exec(
            url.pathname,
          )?.[1] ?? "";

        return HttpClientResponse.fromWeb(
          request,
          Response.json(
            { limit: 1, total: holdings[principal] ?? 0, results: [] },
            { status },
          ),
        );
      }),
    ),
  );

const makePlanTestLayer = (
  config: Partial<AppConfigValues>,
  stacksApi: Layer.Layer<HttpClient.HttpClient>,
) =>
  Layer.effect(PlanService, makePlanService).pipe(
    Layer.provide(stacksApi),
    Layer.provideMerge(AppConfig.layerTest(config)),
    Layer.provideMerge(TestDatabaseLayer),
  );

const createUserWithWallets = (addresses: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const user = yield* createTestUser();

    for (const address of addresses) {
      yield* createTestWalletAddress({ userId: user.id, address });
    }

    return user.id;
  });

describe("plan service", () => {
  it.effect(
    "checks Explorer Guild holdings on the configured Stacks API",
    () => {
      const requests: Array<URL> = [];

      return Effect.gen(function* () {
        const plans = yield* PlanService;

        expect({
          holder: yield* plans.hasTegNft(HOLDER),
          nonHolder: yield* plans.hasTegNft(NON_HOLDER),
        }).toStrictEqual({ holder: true, nonHolder: false });

        expect(requests[0]?.origin + requests[0]?.pathname).toBe(
          `https://stacks-api.test/extended/v3/principals/${HOLDER}/balances/nft`,
        );
        expect(
          Object.fromEntries(requests[0]?.searchParams ?? []),
        ).toStrictEqual({
          asset_identifier: TEG_NFT_ASSET_IDENTIFIER,
          limit: "1",
        });
      }).pipe(
        Effect.provide(
          makePlanTestLayer(
            MAINNET_CONFIG,
            makeStacksApiLayer({ [HOLDER]: 2 }, requests),
          ),
        ),
      );
    },
  );

  it.effect("fails with NftHoldingsError when the Stacks API errors", () =>
    Effect.gen(function* () {
      const plans = yield* PlanService;

      const error = yield* Effect.flip(plans.hasTegNft(HOLDER));

      expect(error).toBeInstanceOf(NftHoldingsError);
    }).pipe(
      Effect.provide(
        makePlanTestLayer(
          MAINNET_CONFIG,
          makeStacksApiLayer({ [HOLDER]: 1 }, [], 429),
        ),
      ),
    ),
  );

  it.effect("returns pro when any of the user's wallets holds the NFT", () =>
    Effect.gen(function* () {
      const plans = yield* PlanService;

      const holderUserId = yield* createUserWithWallets([NON_HOLDER, HOLDER]);
      const nonHolderUserId = yield* createUserWithWallets([OTHER_NON_HOLDER]);
      const walletlessUserId = yield* createUserWithWallets([]);

      expect({
        holder: yield* plans.getUserPlan(holderUserId),
        nonHolder: yield* plans.getUserPlan(nonHolderUserId),
        walletless: yield* plans.getUserPlan(walletlessUserId),
      }).toStrictEqual({
        holder: "pro",
        nonHolder: "free",
        walletless: "free",
      });
    }).pipe(
      Effect.provide(
        makePlanTestLayer(MAINNET_CONFIG, makeStacksApiLayer({ [HOLDER]: 1 })),
      ),
    ),
  );

  it.effect(
    "on testnet, only PRO_ADDRESSES are pro and the Stacks API is not called",
    () => {
      const requests: Array<URL> = [];

      return Effect.gen(function* () {
        const plans = yield* PlanService;

        const emulatedUserId = yield* createUserWithWallets([NON_HOLDER]);
        const holderUserId = yield* createUserWithWallets([HOLDER]);

        expect({
          emulated: yield* plans.getUserPlan(emulatedUserId),
          holder: yield* plans.getUserPlan(holderUserId),
          hasTegNft: yield* plans.hasTegNft(HOLDER),
          requests: requests.length,
        }).toStrictEqual({
          emulated: "pro",
          holder: "free",
          hasTegNft: false,
          requests: 0,
        });
      }).pipe(
        Effect.provide(
          makePlanTestLayer(
            { STACKS_ENV: "testnet", PRO_ADDRESSES: [NON_HOLDER] },
            makeStacksApiLayer({ [HOLDER]: 1 }, requests),
          ),
        ),
      );
    },
  );
});
