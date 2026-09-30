import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { AppConfig } from "@/config";
import { UserWhitelistService } from "@/services/users";
import { createTestUser, createTestWalletAddress } from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";

const TestLayer = UserWhitelistService.layer.pipe(
  Layer.provideMerge(TestDatabaseLayer),
  Layer.provideMerge(AppConfig.layerTest()),
);

describe(UserWhitelistService, () => {
  it.layer(TestLayer)((it) => {
    it.effect(
      "hasWalletAddress returns true only for addresses owned by the user",
      () =>
        Effect.gen(function* () {
          const users = yield* UserWhitelistService;
          const userA = yield* createTestUser();
          const userB = yield* createTestUser();

          yield* createTestWalletAddress({
            userId: userA.id,
            address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          });

          const ownsA = yield* users.hasWalletAddress(
            userA.id,
            "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          );

          const ownsOtherAddress = yield* users.hasWalletAddress(
            userA.id,
            "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
          );

          const userBOwnsA = yield* users.hasWalletAddress(
            userB.id,
            "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          );

          expect({
            ownsA,
            ownsOtherAddress,
            userBOwnsA,
          }).toStrictEqual({
            ownsA: true,
            ownsOtherAddress: false,
            userBOwnsA: false,
          });
        }),
    );
  });
});
