import type { ContractCallBase } from "@stacks/connect";
import type { StacksNetwork, StacksNetworkName } from "@stacks/network";
import { PostConditionMode, stringAsciiCV } from "@stacks/transactions";

export type SetBaseTokenUriParams = {
  // Contract address of the post
  contract: string;
  // The metadata string for the post
  metadata: string;
};

export type SetBaseTokenUriReturn = {
  // Parameters to pass to the stacks.js contract call
  parameters: ContractCallBase;
};

export const setBaseTokenUri = async ({
  params,
  network,
}: {
  params: SetBaseTokenUriParams;
  network: StacksNetwork;
}): Promise<SetBaseTokenUriReturn> => {
  const [contractAddress, contractName] = params.contract.split(".");
  return {
    parameters: {
      contractAddress,
      contractName,
      functionName: "set-base-token-uri",
      functionArgs: [stringAsciiCV(params.metadata)],
      postConditions: [],
      postConditionMode: PostConditionMode.Deny,
      network,
    },
  };
};
