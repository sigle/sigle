import { createClient } from "@sigle/sdk";
import { STACKS_TESTNET } from "@stacks/network";

export const sigleClient = createClient({
  network: STACKS_TESTNET,
});
