import { eq } from "drizzle-orm";
import { Context, Data, Effect, Layer, Schema } from "effect";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { walletAddress } from "@/db/schema";

export type UserPlan = "free" | "pro";

/** The Explorer Guild collection, only deployed on mainnet. */
export const TEG_NFT_ASSET_IDENTIFIER =
  "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild::The-Explorer-Guild";

const STACKS_API_URL = "https://api.hiro.so";

const STACKS_API_TIMEOUT = "10 seconds";

const NftHoldingsResponse = Schema.Struct({ total: Schema.Int });

export class NftHoldingsError extends Data.TaggedError("NftHoldingsError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

export interface PlanClient {
  /** Whether the Stacks address holds at least one Explorer Guild NFT. */
  readonly hasTegNft: (
    address: string,
  ) => Effect.Effect<boolean, NftHoldingsError>;
  /** `pro` when one of the user's wallets is in `PRO_ADDRESSES` or holds an Explorer Guild NFT. */
  readonly getUserPlan: (
    userId: string,
  ) => Effect.Effect<UserPlan, NftHoldingsError>;
}

export const makePlanService = Effect.gen(function* () {
  const config = yield* AppConfig;
  const db = yield* Database;

  const stacksApi = (yield* HttpClient.HttpClient).pipe(
    HttpClient.mapRequest(HttpClientRequest.prependUrl(STACKS_API_URL)),
    HttpClient.filterStatusOk,
  );

  const hasTegNft = (address: string) =>
    Effect.gen(function* () {
      // The collection does not exist on testnet, so no address can hold it.
      if (config.STACKS_ENV !== "mainnet") {
        return false;
      }

      const { total } = yield* HttpClientRequest.get(
        "/extended/v1/tokens/nft/holdings",
      ).pipe(
        HttpClientRequest.setUrlParams({
          principal: address,
          asset_identifiers: TEG_NFT_ASSET_IDENTIFIER,
          limit: "1",
        }),
        stacksApi.execute,
        Effect.flatMap(HttpClientResponse.schemaBodyJson(NftHoldingsResponse)),
        Effect.timeout(STACKS_API_TIMEOUT),
        Effect.mapError(
          (cause) =>
            new NftHoldingsError({
              cause,
              message: `Stacks NFT holdings request failed: ${cause.message}`,
            }),
        ),
      );

      return total > 0;
    });

  return {
    hasTegNft,
    getUserPlan: (userId: string) =>
      Effect.gen(function* () {
        const wallets = yield* db
          .select({ address: walletAddress.address })
          .from(walletAddress)
          .where(eq(walletAddress.userId, userId))
          .pipe(Effect.orDie);

        for (const { address } of wallets) {
          if (
            config.PRO_ADDRESSES.includes(address) ||
            (yield* hasTegNft(address))
          ) {
            return "pro";
          }
        }

        return "free";
      }),
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
