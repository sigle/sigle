import { TEG_NFT_ASSET_IDENTIFIER } from "@sigle/sdk";
import { and, eq, gte, inArray, isNotNull, ne } from "drizzle-orm";
import { Context, Data, Effect, Layer, Schema } from "effect";
import {
  FetchHttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
import { AppConfig } from "@/config";
import { Database, type DatabaseClient } from "@/db";
import { draft, post, user, type userPlans, walletAddress } from "@/db/schema";
import { makeStacksApiClient, STACKS_API_TIMEOUT } from "@/services/stacks-api";

export type UserPlan = (typeof userPlans)[number];

/** Rolling window of the daily limits. */
export const DAILY_LIMIT_WINDOW_MILLIS = 24 * 60 * 60 * 1000;

/** Posts a user can publish per {@link DAILY_LIMIT_WINDOW_MILLIS}. */
export const PUBLISH_LIMITS: Record<UserPlan, number> = {
  free: 3,
  pro: 20,
};

/**
 * Usage of a daily limit from the times of the counted actions: how many, and
 * when the oldest leaves the window (null when none).
 */
const toDailyUsage = (times: ReadonlyArray<Date>) => ({
  used: times.length,
  resetsAt:
    times.length === 0
      ? null
      : new Date(
          Math.min(...times.map((time) => time.getTime())) +
            DAILY_LIMIT_WINDOW_MILLIS,
        ),
});

/**
 * Publishes of a user counted against their daily limit, and when the oldest
 * of them leaves the window (null when none): the posts they published from a
 * draft in the last 24 hours, and their drafts being published. Posts indexed
 * from Arweave have no draft and do not count, nor do failed publishes.
 *
 * `excludeDraftId` leaves out the draft being published, whose earlier publish
 * request it replaces. A single statement, so a draft turning into a post
 * meanwhile is counted once.
 */
export const findPublishUsage = (
  db: DatabaseClient,
  {
    userId,
    now,
    excludeDraftId,
  }: {
    readonly userId: string;
    readonly now: Date;
    readonly excludeDraftId?: string;
  },
) =>
  Effect.gen(function* () {
    const windowStart = new Date(now.getTime() - DAILY_LIMIT_WINDOW_MILLIS);

    const publishes = yield* db
      .select({ at: post.createdAt })
      .from(post)
      .where(
        and(
          eq(post.userId, userId),
          isNotNull(post.draftId),
          gte(post.createdAt, windowStart),
        ),
      )
      .unionAll(
        db
          .select({ at: draft.updatedAt })
          .from(draft)
          .where(
            and(
              eq(draft.userId, userId),
              inArray(draft.txStatus, ["PENDING", "PROCESSING"]),
              // A publish stuck in flight for a day no longer counts.
              gte(draft.updatedAt, windowStart),
              excludeDraftId === undefined
                ? undefined
                : ne(draft.id, excludeDraftId),
            ),
          ),
      )
      .pipe(Effect.orDie);

    return toDailyUsage(publishes.map(({ at }) => at));
  });

const NftBalancesResponse = Schema.Struct({ total: Schema.Int });

export class NftHoldingsError extends Data.TaggedError("NftHoldingsError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

export interface PlanClient {
  /** Whether the Stacks address holds at least one Explorer Guild NFT. */
  readonly hasTegNft: (
    address: string,
  ) => Effect.Effect<boolean, NftHoldingsError>;
  /**
   * The plan the user's wallets qualify for: Pro when one of them holds an
   * Explorer Guild NFT, or on testnet is in `PRO_ADDRESSES`. Stores nothing.
   */
  readonly findUserPlan: (
    userId: string,
  ) => Effect.Effect<UserPlan, NftHoldingsError>;
  /**
   * Stores the plan from `findUserPlan` on the user. A failed check stores
   * nothing, so the stored plan is kept.
   */
  readonly checkUserPlan: (
    userId: string,
  ) => Effect.Effect<UserPlan, NftHoldingsError>;
}

export const makePlanService = Effect.gen(function* () {
  const config = yield* AppConfig;
  const db = yield* Database;

  const stacksApi = yield* makeStacksApiClient;

  const hasTegNft = (address: string) =>
    Effect.gen(function* () {
      // The collection does not exist on testnet, so no address can hold it.
      if (config.STACKS_ENV !== "mainnet") {
        return false;
      }

      const { total } = yield* HttpClientRequest.get(
        `/extended/v3/principals/${encodeURIComponent(address)}/balances/nft`,
      ).pipe(
        HttpClientRequest.setUrlParams({
          asset_identifier: TEG_NFT_ASSET_IDENTIFIER,
          limit: "1",
        }),
        stacksApi.execute,
        Effect.flatMap(HttpClientResponse.schemaBodyJson(NftBalancesResponse)),
        Effect.timeout(STACKS_API_TIMEOUT),
        Effect.mapError(
          (cause) =>
            new NftHoldingsError({
              cause,
              message: `Stacks NFT balances request failed: ${cause.message}`,
            }),
        ),
      );

      return total > 0;
    });

  const findUserPlan = (userId: string) =>
    Effect.gen(function* () {
      const wallets = yield* db
        .select({ address: walletAddress.address })
        .from(walletAddress)
        .where(eq(walletAddress.userId, userId))
        .pipe(Effect.orDie);

      for (const { address } of wallets) {
        if (
          (config.STACKS_ENV === "testnet" &&
            config.PRO_ADDRESSES.includes(address)) ||
          (yield* hasTegNft(address))
        ) {
          return "pro" as const;
        }
      }

      return "free" as const;
    });

  const checkUserPlan = (userId: string) =>
    Effect.gen(function* () {
      const plan = yield* findUserPlan(userId);

      yield* db
        .update(user)
        .set({ plan, planCheckedAt: new Date() })
        .where(eq(user.id, userId))
        .pipe(Effect.orDie);

      return plan;
    });

  return { hasTegNft, findUserPlan, checkUserPlan } satisfies PlanClient;
});

export class PlanService extends Context.Service<PlanService, PlanClient>()(
  "sigle/PlanService",
) {
  static readonly layer: Layer.Layer<PlanService, never, AppConfig | Database> =
    Layer.effect(PlanService, makePlanService).pipe(
      Layer.provide(FetchHttpClient.layer),
    );
}
