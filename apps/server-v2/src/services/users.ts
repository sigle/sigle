import { asc, desc, eq, inArray } from "drizzle-orm";
import { Effect } from "effect";
import { Database } from "@/db";
import { walletAddress } from "@/db/schema";

// The primary wallet first, then the others from oldest to newest, so the
// first is the user's primary address even when no wallet is marked primary.
const PRIMARY_FIRST = [
  desc(walletAddress.isPrimary),
  asc(walletAddress.createdAt),
] as const;

// Users sign in with a wallet, so a user without one is a defect.
const missingWalletAddress = (userId: string) =>
  Effect.die(new Error(`User ${userId} has no linked wallet address`));

/**
 * Addresses of a user's wallets, the primary one first. Dies when the user has
 * no wallet.
 */
export const findWalletAddresses = (userId: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const wallets = yield* db
      .select({ address: walletAddress.address })
      .from(walletAddress)
      .where(eq(walletAddress.userId, userId))
      .orderBy(...PRIMARY_FIRST)
      .pipe(Effect.orDie);

    const [primary, ...others] = wallets.map((wallet) => wallet.address);

    if (primary === undefined) {
      return yield* missingWalletAddress(userId);
    }

    return [primary, ...others] as const;
  });

/**
 * Primary Stacks address of each user, in the order of `userIds`. Dies when
 * one of the users has no wallet.
 */
export const findPrimaryWalletAddresses = (userIds: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    if (userIds.length === 0) {
      return [];
    }

    const db = yield* Database;

    const wallets = yield* db
      .select({ userId: walletAddress.userId, address: walletAddress.address })
      .from(walletAddress)
      .where(inArray(walletAddress.userId, [...new Set(userIds)]))
      .orderBy(...PRIMARY_FIRST)
      .pipe(Effect.orDie);

    const primaries = new Map<string, string>();

    for (const wallet of wallets) {
      if (!primaries.has(wallet.userId)) {
        primaries.set(wallet.userId, wallet.address);
      }
    }

    return yield* Effect.forEach(userIds, (userId) => {
      const address = primaries.get(userId);

      return address === undefined
        ? missingWalletAddress(userId)
        : Effect.succeed(address);
    });
  });
