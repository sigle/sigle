import type { CallContractParams } from "@stacks/connect/dist/types/methods.js";
import type { StacksNetworkName } from "@stacks/network";
import { stringAsciiCV } from "@stacks/transactions";

export interface SetBaseTokenUriParams {
  // Contract address of the post
  contract: string;
  // The metadata string for the post
  metadata: string;
}

export interface SetBaseTokenUriReturn {
  // Parameters to pass to the stacks.js contract call
  parameters: CallContractParams;
}

export const setBaseTokenUri = ({
  params,
  networkName,
}: {
  params: SetBaseTokenUriParams;
  networkName: StacksNetworkName;
}): SetBaseTokenUriReturn => {
  const [contractAddress, contractName] = params.contract.split(".");
  return {
    parameters: {
      contract: `${contractAddress}.${contractName}`,
      functionName: "set-base-token-uri",
      functionArgs: [stringAsciiCV(params.metadata)],
      postConditions: [],
      postConditionMode: "deny",
      network: networkName,
    },
  };
};
