import { TEG_NFT_ASSET_IDENTIFIER } from "@sigle/sdk";
import { and, eq, gte, inArray, isNotNull, ne } from "drizzle-orm";
import { Cache, Context, Data, Effect, Exit, Layer, Schema } from "effect";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
import { AppConfig } from "@/config";
import { Database, type DatabaseClient } from "@/db";
import { draft, post, walletAddress } from "@/db/schema";

export type UserPlan = "free" | "pro";

/** Posts a user can publish per {@link PUBLISH_LIMIT_WINDOW_MILLIS}. */
export const PUBLISH_LIMITS: Record<UserPlan, number> = {
  free: 3,
  pro: 20,
};

/** Rolling window of the publish limit. */
export const PUBLISH_LIMIT_WINDOW_MILLIS = 24 * 60 * 60 * 1000;

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
    const windowStart = new Date(now.getTime() - PUBLISH_LIMIT_WINDOW_MILLIS);

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

    const oldest = Math.min(...publishes.map(({ at }) => at.getTime()));

    return {
      used: publishes.length,
      resetsAt:
        publishes.length === 0
          ? null
          : new Date(oldest + PUBLISH_LIMIT_WINDOW_MILLIS),
    };
  });

const STACKS_API_TIMEOUT = "10 seconds";

// A plan change, such as buying or selling the NFT, can take this long to show.
const USER_PLAN_CACHE_TTL = "12 hours";

const USER_PLAN_CACHE_CAPACITY = 10_000;

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
   * `pro` when one of the user's wallets holds an Explorer Guild NFT, or on
   * testnet is in `PRO_ADDRESSES`. Results are cached in memory per user.
   */
  readonly getUserPlan: (
    userId: string,
  ) => Effect.Effect<UserPlan, NftHoldingsError>;
}

export const makePlanService = Effect.gen(function* () {
  const config = yield* AppConfig;
  const db = yield* Database;

  const stacksApi = (yield* HttpClient.HttpClient).pipe(
    HttpClient.mapRequest(
      HttpClientRequest.prependUrl(config.STACKS_API_URL.replace(/\/+$/, "")),
    ),
    HttpClient.filterStatusOk,
  );

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

  const userPlans = yield* Cache.makeWith(
    (userId: string) =>
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
      }),
    {
      capacity: USER_PLAN_CACHE_CAPACITY,
      // Failed lookups are not cached so the next call retries the Stacks API.
      timeToLive: (exit) => (Exit.isSuccess(exit) ? USER_PLAN_CACHE_TTL : 0),
    },
  );

  return {
    hasTegNft,
    getUserPlan: (userId: string) => Cache.get(userPlans, userId),
  } satisfies PlanClient;
});

export class PlanService extends Context.Service<PlanService, PlanClient>()(
  "sigle/PlanService",
) {
  static readonly layer: Layer.Layer<PlanService, never, AppConfig | Database> =
    Layer.effect(PlanService, makePlanService).pipe(
      Layer.provide(FetchHttpClient.layer),
    );
}
