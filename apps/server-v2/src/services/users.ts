import { eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { walletAddress } from "@/db/schema";

const WHITELISTED_ADDRESSES: ReadonlyArray<string> = [];

export interface UserWhitelist {
  readonly isUserWhitelisted: (userId: string) => Effect.Effect<boolean>;
}

export const makeUserWhitelistService = Effect.gen(function* () {
  const config = yield* AppConfig;
  const db = yield* Database;

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
          .limit(1)
          .pipe(Effect.orDie);

        const [wallet] = wallets;

        return (
          wallet !== undefined && WHITELISTED_ADDRESSES.includes(wallet.address)
        );
      }),
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
