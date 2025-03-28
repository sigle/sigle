import { createClient } from "@stacks/blockchain-api-client";
import { STACKS_DEVNET, STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";
import { env } from "~/env";

export const stacksNetwork =
  env.STACKS_ENV === "mainnet"
    ? STACKS_MAINNET
    : env.STACKS_ENV === "testnet"
      ? STACKS_TESTNET
      : STACKS_DEVNET;

export const stacksApiClient = createClient({
  baseUrl: `https://api.${env.STACKS_ENV}.hiro.so`,
});
