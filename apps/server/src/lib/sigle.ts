import { createClient } from "@sigle/sdk";
import { STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";
import { env } from "@/env";

const stacksNetworks = {
  mainnet: STACKS_MAINNET,
  testnet: STACKS_TESTNET,
};

export const sigleClient = createClient({
  networkName: env.STACKS_ENV,
  network: stacksNetworks[env.STACKS_ENV],
});
