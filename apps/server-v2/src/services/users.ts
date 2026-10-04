import { and, eq } from "drizzle-orm";
import { Context, Effect, Layer, Option } from "effect";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { walletAddress } from "@/db/schema";

const WHITELISTED_ADDRESSES: ReadonlyArray<string> = [];

export interface UserWhitelist {
  readonly isUserWhitelisted: (userId: string) => Effect.Effect<boolean>;
  readonly isUserAdmin: (userId: string) => Effect.Effect<boolean>;
  readonly hasWalletAddress: (
    userId: string,
    address: string,
  ) => Effect.Effect<boolean>;
  readonly getWalletAddress: (
    userId: string,
    address: string,
  ) => Effect.Effect<Option.Option<typeof walletAddress.$inferSelect>>;
}

export const makeUserWhitelistService = Effect.gen(function* () {
  const config = yield* AppConfig;
  const db = yield* Database;

  const getWalletAddress = (userId: string, address: string) =>
    Effect.gen(function* () {
      const [found] = yield* db
        .select()
        .from(walletAddress)
        .where(
          and(
            eq(walletAddress.userId, userId),
            eq(walletAddress.address, address),
          ),
        )
        .limit(1)
        .pipe(Effect.orDie);

      return Option.fromNullishOr(found);
    });

  return {
    isUserWhitelisted: (userId: string) =>
      Effect.gen(function* () {
        if (config.STACKS_ENV === "testnet") {
          return true;
        }

        const wallets = yield* db
          .select({ address: walletAddress.address })
          .from(walletAddress)
          .where(eq(walletAddress.userId, userId))
          .pipe(Effect.orDie);

        return wallets.some((wallet) =>
          WHITELISTED_ADDRESSES.includes(wallet.address),
        );
      }),
    isUserAdmin: (userId: string) =>
      Effect.gen(function* () {
        if (config.ADMIN_ADDRESSES.length === 0) {
          return false;
        }

        const wallets = yield* db
          .select({ address: walletAddress.address })
          .from(walletAddress)
          .where(eq(walletAddress.userId, userId))
          .pipe(Effect.orDie);

        return wallets.some((wallet) =>
          config.ADMIN_ADDRESSES.includes(wallet.address),
        );
      }),
    hasWalletAddress: (userId: string, address: string) =>
      Effect.map(getWalletAddress(userId, address), Option.isSome),
    getWalletAddress,
  } satisfies UserWhitelist;
});

export class UserWhitelistService extends Context.Service<
  UserWhitelistService,
  UserWhitelist
>()("sigle/UserWhitelistService") {
  static readonly layer: Layer.Layer<
    UserWhitelistService,
    never,
    AppConfig | Database
  > = Layer.effect(UserWhitelistService, makeUserWhitelistService);
}
