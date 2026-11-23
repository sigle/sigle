import { describe, expect, it } from "@effect/vitest";
import { TEG_NFT_ASSET_IDENTIFIER } from "@sigle/sdk";
import { eq } from "drizzle-orm";
import { Effect, Layer, Option, Redacted } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import { AppConfig, type AppConfigValues } from "@/config";
import { Database } from "@/db";
import { user } from "@/db/schema";
import { reconcileUserPlans } from "@/jobs/plan-reconcile";
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
  status: (principal: string) => number = () => 200,
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
            { status: status(principal) },
          ),
        );
      }),
    ),
  );

const makePlanTestLayer = (
  config: Partial<AppConfigValues>,
  stacksApi: Layer.Layer<HttpClient.HttpClient, never, Database>,
) =>
  Layer.effect(PlanService, makePlanService).pipe(
    Layer.provide(stacksApi),
    Layer.provideMerge(AppConfig.layerTest(config)),
    Layer.provideMerge(TestDatabaseLayer),
  );

const createUserWithWallets = (
  addresses: ReadonlyArray<string>,
  overrides: Partial<typeof user.$inferInsert> = {},
) =>
  Effect.gen(function* () {
    const created = yield* createTestUser(overrides);

    for (const address of addresses) {
      yield* createTestWalletAddress({ userId: created.id, address });
    }

    return created.id;
  });

const findStoredPlan = (userId: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [row] = yield* db
      .select({ plan: user.plan, planCheckedAt: user.planCheckedAt })
      .from(user)
      .where(eq(user.id, userId));

    return row;
  });

const HOUR_MILLIS = 60 * 60 * 1000;

const hoursAgo = (hours: number) => new Date(Date.now() - hours * HOUR_MILLIS);

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

  it.effect("sends HIRO_API_KEY as x-api-key only when it is set", () => {
    const apiKeys: Array<string | undefined> = [];

    const recordApiKey = Layer.succeed(
      HttpClient.HttpClient,
      HttpClient.make((request) =>
        Effect.sync(() => {
          apiKeys.push(request.headers["x-api-key"]);

          return HttpClientResponse.fromWeb(
            request,
            Response.json({ limit: 1, total: 0, results: [] }),
          );
        }),
      ),
    );

    const hasTegNft = PlanService.use((plans) => plans.hasTegNft(HOLDER));

    return Effect.gen(function* () {
      yield* hasTegNft.pipe(
        Effect.provide(
          makePlanTestLayer(
            {
              ...MAINNET_CONFIG,
              HIRO_API_KEY: Option.some(Redacted.make("hiro-test-key")),
            },
            recordApiKey,
          ),
        ),
      );

      yield* hasTegNft.pipe(
        Effect.provide(makePlanTestLayer(MAINNET_CONFIG, recordApiKey)),
      );

      expect(apiKeys).toStrictEqual(["hiro-test-key", undefined]);
    });
  });

  it.effect("fails with NftHoldingsError when the Stacks API errors", () =>
    Effect.gen(function* () {
      const plans = yield* PlanService;

      const error = yield* Effect.flip(plans.hasTegNft(HOLDER));

      expect(error).toBeInstanceOf(NftHoldingsError);
    }).pipe(
      Effect.provide(
        makePlanTestLayer(
          MAINNET_CONFIG,
          makeStacksApiLayer({ [HOLDER]: 1 }, [], () => 429),
        ),
      ),
    ),
  );

  it.effect(
    "on mainnet, stores pro when a wallet holds the NFT and ignores PRO_ADDRESSES",
    () =>
      Effect.gen(function* () {
        const plans = yield* PlanService;

        const holderUserId = yield* createUserWithWallets([NON_HOLDER, HOLDER]);

        const nonHolderUserId = yield* createUserWithWallets([
          OTHER_NON_HOLDER,
        ]);

        const walletlessUserId = yield* createUserWithWallets([]);

        expect({
          holder: yield* plans.checkUserPlan(holderUserId),
          nonHolder: yield* plans.checkUserPlan(nonHolderUserId),
          walletless: yield* plans.checkUserPlan(walletlessUserId),
          stored: [
            (yield* findStoredPlan(holderUserId))?.plan,
            (yield* findStoredPlan(nonHolderUserId))?.plan,
            (yield* findStoredPlan(walletlessUserId))?.plan,
          ],
        }).toStrictEqual({
          holder: "pro",
          nonHolder: "free",
          walletless: "free",
          stored: ["pro", "free", "free"],
        });
      }).pipe(
        Effect.provide(
          makePlanTestLayer(
            { ...MAINNET_CONFIG, PRO_ADDRESSES: [OTHER_NON_HOLDER] },
            makeStacksApiLayer({ [HOLDER]: 1 }),
          ),
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
          emulated: yield* plans.checkUserPlan(emulatedUserId),
          holder: yield* plans.checkUserPlan(holderUserId),
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

  it.effect("keeps the stored plan when the check fails", () => {
    let status = 200;

    return Effect.gen(function* () {
      const plans = yield* PlanService;
      const userId = yield* createUserWithWallets([HOLDER]);

      yield* plans.checkUserPlan(userId);
      const afterCheck = yield* findStoredPlan(userId);

      status = 503;
      yield* Effect.flip(plans.checkUserPlan(userId));

      expect({
        plan: afterCheck?.plan,
        checked: afterCheck?.planCheckedAt instanceof Date,
        afterFailure: yield* findStoredPlan(userId),
      }).toStrictEqual({
        plan: "pro",
        checked: true,
        afterFailure: afterCheck,
      });
    }).pipe(
      Effect.provide(
        makePlanTestLayer(
          MAINNET_CONFIG,
          makeStacksApiLayer({ [HOLDER]: 1 }, [], () => status),
        ),
      ),
    );
  });
});

describe("plan reconciliation", () => {
  const SELLER = "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS";
  const UNREACHABLE = "SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335";

  it.effect(
    "re-checks only the pro users not checked recently, and never upgrades",
    () =>
      Effect.gen(function* () {
        const proSince = (hours: number) => ({
          plan: "pro" as const,
          planCheckedAt: hoursAgo(hours),
        });

        const users = {
          seller: yield* createUserWithWallets([SELLER], proSince(7)),
          holder: yield* createUserWithWallets([HOLDER], proSince(7)),
          recentSeller: yield* createUserWithWallets(
            [OTHER_NON_HOLDER],
            proSince(1),
          ),
          unreachable: yield* createUserWithWallets([UNREACHABLE], proSince(7)),
          // Holds the NFT but never activated Pro.
          freeHolder: yield* createUserWithWallets([NON_HOLDER]),
        };

        yield* reconcileUserPlans;

        const plansAfter = Object.fromEntries(
          yield* Effect.forEach(Object.entries(users), ([name, id]) =>
            Effect.map(findStoredPlan(id), (row) => [name, row?.plan]),
          ),
        );

        const holderCheckedAt = (yield* findStoredPlan(users.holder))
          ?.planCheckedAt;

        expect({
          plansAfter,
          holderRechecked:
            holderCheckedAt !== undefined &&
            holderCheckedAt !== null &&
            holderCheckedAt > hoursAgo(1),
        }).toStrictEqual({
          plansAfter: {
            seller: "free",
            holder: "pro",
            recentSeller: "pro",
            unreachable: "pro",
            freeHolder: "free",
          },
          holderRechecked: true,
        });
      }).pipe(
        Effect.provide(
          makePlanTestLayer(
            MAINNET_CONFIG,
            makeStacksApiLayer(
              { [HOLDER]: 1, [NON_HOLDER]: 1 },
              [],
              (principal) => (principal === UNREACHABLE ? 503 : 200),
            ),
          ),
        ),
      ),
  );

  it.effect(
    "does not upgrade a user who went back to free during their check",
    () => {
      // The user's refresh stores Free while the job checks their wallet,
      // which by then holds the NFT again.
      const downgradeDuringCheck = Layer.effect(
        HttpClient.HttpClient,
        Effect.gen(function* () {
          const db = yield* Database;

          return HttpClient.make((request) =>
            db
              .update(user)
              .set({ plan: "free" })
              .pipe(
                Effect.orDie,
                Effect.as(
                  HttpClientResponse.fromWeb(
                    request,
                    Response.json({ limit: 1, total: 1, results: [] }),
                  ),
                ),
              ),
          );
        }),
      );

      return Effect.gen(function* () {
        const userId = yield* createUserWithWallets([HOLDER], {
          plan: "pro",
          planCheckedAt: hoursAgo(7),
        });

        yield* reconcileUserPlans;

        expect((yield* findStoredPlan(userId))?.plan).toBe("free");
      }).pipe(
        Effect.provide(makePlanTestLayer(MAINNET_CONFIG, downgradeDuringCheck)),
      );
    },
  );
});
