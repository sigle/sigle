import { TEG_NFT_ASSET_IDENTIFIER } from "@sigle/sdk";
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
  /** `pro` when one of the user's wallets is in `PRO_ADDRESSES` or holds an Explorer Guild NFT. */
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
