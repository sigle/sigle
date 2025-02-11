import type { StacksNetwork, StacksNetworkName } from "@stacks/network";
import type { ContractCallBase } from "@stacks/connect";
import { PostConditionMode, stringAsciiCV } from "@stacks/transactions";
import { config } from "./config.js";

export type SetProfileParams = {
  /**
   * The metadata string for the profile
   */
  metadata: string;
};

export type SetProfileReturn = {
  // Parameters to pass to the stacks.js contract call
  parameters: ContractCallBase;
};

export const setProfile = ({
  params,
  network,
  networkName,
}: {
  params: SetProfileParams;
  network: StacksNetwork;
  networkName: StacksNetworkName;
}): SetProfileReturn => {
  const protocolAddress = config[networkName].protocolAddress;

  return {
    parameters: {
      contractAddress: protocolAddress,
      contractName: "sigle-profiles",
      functionName: "set-profile",
      functionArgs: [stringAsciiCV(params.metadata)],
      postConditionMode: PostConditionMode.Deny,
      network,
    },
  };
};
