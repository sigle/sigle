import { describe, expect, it } from "@effect/vitest";
import { and, eq } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { user, walletAddress } from "@/db/schema";
import {
  STACKS_MAINNET_CHAIN_ID,
  STACKS_TESTNET_CHAIN_ID,
  UserProvisioningService,
} from "@/services/user-provisioning";
import { TestDatabaseLayer } from "@/test/layer";

const makeTestLayer = (stacksEnv: "mainnet" | "testnet") =>
  UserProvisioningService.layer.pipe(
    Layer.provideMerge(
      Layer.merge(
        AppConfig.layerTest({ STACKS_ENV: stacksEnv }),
        TestDatabaseLayer,
      ),
    ),
  );

const findWallet = (address: string, chainId: number) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [wallet] = yield* db
      .select()
      .from(walletAddress)
      .where(
        and(
          eq(walletAddress.address, address),
          eq(walletAddress.chainId, chainId),
        ),
      )
      .limit(1)
      .pipe(Effect.orDie);

    return wallet;
  });

const findUser = (id: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [found] = yield* db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1)
      .pipe(Effect.orDie);

    return found;
  });

describe("user provisioning service", () => {
  it.effect("creates a user and wallet on first sight", () => {
    const address = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

    return Effect.gen(function* () {
      const provisioning = yield* UserProvisioningService;

      const ensured = yield* provisioning.ensureUserByWalletAddress(address);

      const wallet = yield* findWallet(address, STACKS_TESTNET_CHAIN_ID);
      const createdUser = yield* findUser(ensured.userId);

      expect({
        walletAddressId: ensured.walletAddressId,
        walletId: wallet?.id,
        walletUserId: wallet?.userId,
        walletAddress: wallet?.address,
        walletChainId: wallet?.chainId,
        walletIsPrimary: wallet?.isPrimary,
        userId: createdUser?.id,
      }).toStrictEqual({
        walletAddressId: ensured.walletAddressId,
        walletId: ensured.walletAddressId,
        walletUserId: ensured.userId,
        walletAddress: address,
        walletChainId: STACKS_TESTNET_CHAIN_ID,
        walletIsPrimary: true,
        userId: ensured.userId,
      });
    }).pipe(Effect.provide(makeTestLayer("testnet")));
  });

  it.effect("is idempotent for a known wallet address", () =>
    Effect.gen(function* () {
      const provisioning = yield* UserProvisioningService;
      const address = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

      const first = yield* provisioning.ensureUserByWalletAddress(address);
      const second = yield* provisioning.ensureUserByWalletAddress(address);

      expect(second).toStrictEqual(first);
    }).pipe(Effect.provide(makeTestLayer("testnet"))),
  );

  it.effect("uses the mainnet chain id on mainnet", () =>
    Effect.gen(function* () {
      const provisioning = yield* UserProvisioningService;
      const address = "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7";

      yield* provisioning.ensureUserByWalletAddress(address);

      const wallet = yield* findWallet(address, STACKS_MAINNET_CHAIN_ID);

      expect(wallet?.chainId).toBe(STACKS_MAINNET_CHAIN_ID);
    }).pipe(Effect.provide(makeTestLayer("mainnet"))),
  );
});
