import { TEG_NFT_ASSET_IDENTIFIER } from "@sigle/sdk";
import {
  and,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  ne,
  type SQL,
} from "drizzle-orm";
import { Context, Data, Effect, Layer, Option, Redacted, Schema } from "effect";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
import { AppConfig } from "@/config";
import { Database, type DatabaseClient } from "@/db";
import {
  draft,
  post,
  profileUpdate,
  user,
  type userPlans,
  walletAddress,
} from "@/db/schema";

export type UserPlan = (typeof userPlans)[number];

/** Rolling window of the daily limits. */
export const DAILY_LIMIT_WINDOW_MILLIS = 24 * 60 * 60 * 1000;

/** Posts a user can publish per {@link DAILY_LIMIT_WINDOW_MILLIS}. */
export const PUBLISH_LIMITS: Record<UserPlan, number> = {
  free: 3,
  pro: 20,
};

/**
 * Profile updates a user can make per {@link DAILY_LIMIT_WINDOW_MILLIS}, on
 * every plan.
 */
export const PROFILE_UPDATE_LIMIT = 10;

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

interface PublishUsageOptions {
  readonly now: Date;
  /**
   * The draft being published, left out: its earlier publish request is
   * replaced by this one.
   */
  readonly excludeDraftId?: string;
}

/**
 * Publishes counted against a daily limit, and when the oldest of them leaves
 * the window (null when none): the posts published from a draft in the last 24
 * hours, and the drafts being published. Posts indexed from Arweave have no
 * draft and do not count, nor do failed publishes. A single statement, so a
 * draft turning into a post meanwhile is counted once.
 *
 * `isCounted` selects whose publishes count from their user ID column, so the
 * per-user and per-plan limits count publishes the same way.
 */
const findPublishUsage = (
  db: DatabaseClient,
  isCounted: (userIdColumn: typeof post.userId | typeof draft.userId) => SQL,
  { now, excludeDraftId }: PublishUsageOptions,
) =>
  Effect.gen(function* () {
    const windowStart = new Date(now.getTime() - DAILY_LIMIT_WINDOW_MILLIS);

    const publishes = yield* db
      .select({ at: post.createdAt })
      .from(post)
      .where(
        and(
          isCounted(post.userId),
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
              isCounted(draft.userId),
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

/**
 * Publishes of a user counted against their daily limit, see
 * {@link findPublishUsage}.
 */
export const findUserPublishUsage = (
  db: DatabaseClient,
  { userId, ...options }: PublishUsageOptions & { readonly userId: string },
) => findPublishUsage(db, (userIdColumn) => eq(userIdColumn, userId), options);

/**
 * Publishes of every user currently on a plan, counted against the global
 * daily limit of the plan, see {@link findPublishUsage}.
 */
export const findPlanPublishUsage = (
  db: DatabaseClient,
  { plan, ...options }: PublishUsageOptions & { readonly plan: UserPlan },
) =>
  findPublishUsage(
    db,
    (userIdColumn) =>
      inArray(
        userIdColumn,
        db.select({ id: user.id }).from(user).where(eq(user.plan, plan)),
      ),
    options,
  );

/**
 * Profile updates of a user counted against their daily limit, see
 * {@link toDailyUsage}: the successful updates of the last 24 hours, across all
 * their addresses.
 */
export const findProfileUpdateUsage = (
  db: DatabaseClient,
  { userId, now }: { readonly userId: string; readonly now: Date },
) =>
  Effect.gen(function* () {
    const updates = yield* db
      .select({ at: profileUpdate.createdAt })
      .from(profileUpdate)
      .where(
        and(
          eq(profileUpdate.userId, userId),
          // An update stops counting at its reset time.
          gt(
            profileUpdate.createdAt,
            new Date(now.getTime() - DAILY_LIMIT_WINDOW_MILLIS),
          ),
        ),
      )
      .pipe(Effect.orDie);

    return toDailyUsage(updates.map(({ at }) => at));
  });

const STACKS_API_TIMEOUT = "10 seconds";

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

  const stacksApi = (yield* HttpClient.HttpClient).pipe(
    HttpClient.mapRequest(
      HttpClientRequest.prependUrl(config.STACKS_API_URL.replace(/\/+$/, "")),
    ),
    HttpClient.mapRequest((request) =>
      Option.match(config.HIRO_API_KEY, {
        onNone: () => request,
        onSome: (apiKey) =>
          HttpClientRequest.setHeader(
            request,
            "x-api-key",
            Redacted.value(apiKey),
          ),
      }),
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
