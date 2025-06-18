import type { ContractCallBase } from "@stacks/connect";
import type { StacksNetwork } from "@stacks/network";
import {
  contractPrincipalCV,
  noneCV,
  PostConditionMode,
} from "@stacks/transactions";

export type OwnerMintParams = {
  // Contract address of the post
  contract: string;
  // Address to receive the minted tokens
  recipient?: string;
};

export type OwnerMintReturn = {
  // Parameters to pass to the stacks.js contract call
  parameters: ContractCallBase;
};

export const ownerMint = async ({
  params,
  network,
}: {
  params: OwnerMintParams;
  network: StacksNetwork;
}): Promise<OwnerMintReturn> => {
  const [contractAddress, contractName] = params.contract.split(".");

  return {
    parameters: {
      contractAddress,
      contractName,
      functionName: "owner-mint",
      functionArgs: [
        params.recipient
          ? contractPrincipalCV(params.recipient, contractName)
          : noneCV(),
      ],
      postConditions: [],
      postConditionMode: PostConditionMode.Deny,
      network,
    },
  };
};
