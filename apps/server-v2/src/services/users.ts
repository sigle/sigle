import { asc, desc, eq } from "drizzle-orm";
import { Effect } from "effect";
import { Database } from "@/db";
import { walletAddress } from "@/db/schema";

/**
 * Addresses of a user's wallets: the primary one first, then the others from
 * oldest to newest, so the first is the user's primary address even when no
 * wallet is marked primary. Users sign in with a wallet, so a user without
 * one is a defect.
 */
export const findWalletAddresses = (userId: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const wallets = yield* db
      .select({ address: walletAddress.address })
      .from(walletAddress)
      .where(eq(walletAddress.userId, userId))
      .orderBy(desc(walletAddress.isPrimary), asc(walletAddress.createdAt))
      .pipe(Effect.orDie);

    const [primary, ...others] = wallets.map((wallet) => wallet.address);

    if (primary === undefined) {
      return yield* Effect.die(
        new Error(`User ${userId} has no linked wallet address`),
      );
    }

    return [primary, ...others] as const;
  });
