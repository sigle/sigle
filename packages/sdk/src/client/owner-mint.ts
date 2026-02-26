import type { CallContractParams } from "@stacks/connect/dist/types/methods.js";
import type { StacksNetworkName } from "@stacks/network";
import { contractPrincipalCV, noneCV } from "@stacks/transactions";

export interface OwnerMintParams {
  // Contract address of the post
  contract: string;
  // Address to receive the minted tokens
  recipient?: string;
}

export interface OwnerMintReturn {
  // Parameters to pass to the stacks.js contract call
  parameters: CallContractParams;
}

export const ownerMint = async ({
  params,
  networkName,
}: {
  params: OwnerMintParams;
  networkName: StacksNetworkName;
}): Promise<OwnerMintReturn> => {
  const [contractAddress, contractName] = params.contract.split(".");

  return {
    parameters: {
      contract: `${contractAddress}.${contractName}`,
      functionName: "owner-mint",
      functionArgs: [
        params.recipient
          ? contractPrincipalCV(params.recipient, contractName)
          : noneCV(),
      ],
      postConditions: [],
      postConditionMode: "deny",
      network: networkName,
    },
  };
};
