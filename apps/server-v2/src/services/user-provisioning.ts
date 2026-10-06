import { and, eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { user, walletAddress } from "@/db/schema";

export const STACKS_MAINNET_CHAIN_ID = 1;

export const STACKS_TESTNET_CHAIN_ID = 2_147_483_648;

export interface EnsuredUser {
  readonly userId: string;
  readonly walletAddressId: string;
}

export interface UserProvisioningOperations {
  /**
   * Returns the local user owning a wallet address, creating an empty user and
   * its primary wallet row on first sight. Used when indexing content authored
   * by wallets that never signed in to this server.
   */
  readonly ensureUserByWalletAddress: (
    address: string,
  ) => Effect.Effect<EnsuredUser>;
}

export const makeUserProvisioningService = Effect.gen(function* () {
  const config = yield* AppConfig;
  const db = yield* Database;

  const chainId =
    config.STACKS_ENV === "mainnet"
      ? STACKS_MAINNET_CHAIN_ID
      : STACKS_TESTNET_CHAIN_ID;

  const findWallet = (address: string) =>
    db
      .select({
        id: walletAddress.id,
        userId: walletAddress.userId,
      })
      .from(walletAddress)
      .where(
        and(
          eq(walletAddress.address, address),
          eq(walletAddress.chainId, chainId),
        ),
      )
      .limit(1)
      .pipe(Effect.orDie);

  return {
    ensureUserByWalletAddress: (address) =>
      Effect.gen(function* () {
        const [existing] = yield* findWallet(address);

        if (existing !== undefined) {
          return { userId: existing.userId, walletAddressId: existing.id };
        }

        return yield* db
          .transaction((tx) =>
            Effect.gen(function* () {
              const userId = crypto.randomUUID();
              const walletAddressId = crypto.randomUUID();

              yield* tx.insert(user).values({ id: userId });

              const [createdWallet] = yield* tx
                .insert(walletAddress)
                .values({
                  id: walletAddressId,
                  userId,
                  address,
                  chainId,
                  isPrimary: true,
                  createdAt: new Date(),
                })
                .onConflictDoNothing()
                .returning({
                  id: walletAddress.id,
                  userId: walletAddress.userId,
                });

              if (createdWallet !== undefined) {
                return { userId, walletAddressId };
              }

              // A concurrent caller created the wallet first; drop the user row
              // created for this attempt and use the winner's.
              yield* tx.delete(user).where(eq(user.id, userId));

              const [raced] = yield* tx
                .select({
                  id: walletAddress.id,
                  userId: walletAddress.userId,
                })
                .from(walletAddress)
                .where(
                  and(
                    eq(walletAddress.address, address),
                    eq(walletAddress.chainId, chainId),
                  ),
                )
                .limit(1);

              if (raced === undefined) {
                return yield* Effect.die(
                  new Error(
                    `Wallet address ${address} disappeared during provisioning`,
                  ),
                );
              }

              return { userId: raced.userId, walletAddressId: raced.id };
            }),
          )
          .pipe(Effect.orDie);
      }),
  } satisfies UserProvisioningOperations;
});

export class UserProvisioningService extends Context.Service<
  UserProvisioningService,
  UserProvisioningOperations
>()("sigle/UserProvisioningService") {
  static readonly layer: Layer.Layer<
    UserProvisioningService,
    never,
    AppConfig | Database
  > = Layer.effect(UserProvisioningService, makeUserProvisioningService);
}
