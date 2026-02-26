import type { CallContractParams } from "@stacks/connect/dist/types/methods.js";
import type { StacksNetworkName } from "@stacks/network";
import { stringAsciiCV } from "@stacks/transactions";
import { config } from "./config.js";

export interface SetProfileParams {
  /**
   * The metadata string for the profile
   */
  metadata: string;
}

export interface SetProfileReturn {
  // Parameters to pass to the stacks.js contract call
  parameters: CallContractParams;
}

export const setProfile = ({
  params,
  networkName,
}: {
  params: SetProfileParams;
  networkName: StacksNetworkName;
}): SetProfileReturn => {
  const protocolAddress = config[networkName].protocolAddress;

  return {
    parameters: {
      contract: `${protocolAddress}.sigle-profiles-v001`,
      functionName: "set-profile",
      functionArgs: [stringAsciiCV(params.metadata)],
      postConditionMode: "deny",
      network: networkName,
    },
  };
};
