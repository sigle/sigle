import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { Context, Effect, Layer, Option } from "effect";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { walletAddress } from "@/db/schema";

const WHITELISTED_ADDRESSES: ReadonlyArray<string> = [];

/**
 * Primary Stacks address of each user, falling back to their oldest wallet.
 * Users without a linked wallet are missing from the returned map.
 */
export const findPrimaryWalletAddresses = (userIds: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    if (userIds.length === 0) {
      return new Map<string, string>();
    }

    const db = yield* Database;

    const wallets = yield* db
      .select({ userId: walletAddress.userId, address: walletAddress.address })
      .from(walletAddress)
      .where(inArray(walletAddress.userId, [...userIds]))
      .orderBy(desc(walletAddress.isPrimary), asc(walletAddress.createdAt))
      .pipe(Effect.orDie);

    const addresses = new Map<string, string>();

    for (const wallet of wallets) {
      if (!addresses.has(wallet.userId)) {
        addresses.set(wallet.userId, wallet.address);
      }
    }

    return addresses;
  });

/**
 * Primary Stacks address of a user, falling back to their oldest wallet.
 * `null` when the user has no linked wallet.
 */
export const findPrimaryWalletAddress = (userId: string) =>
  Effect.map(
    findPrimaryWalletAddresses([userId]),
    (addresses) => addresses.get(userId) ?? null,
  );

export interface UserWhitelist {
  readonly isUserWhitelisted: (userId: string) => Effect.Effect<boolean>;
  readonly isUserAdmin: (userId: string) => Effect.Effect<boolean>;
  readonly hasWalletAddress: (
    userId: string,
    address: string,
  ) => Effect.Effect<boolean>;
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
