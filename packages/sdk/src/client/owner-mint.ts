import type { ContractCallBase } from "@stacks/connect";
import type { StacksNetwork, StacksNetworkName } from "@stacks/network";
import {
  PostConditionMode,
  contractPrincipalCV,
  fetchCallReadOnlyFunction,
  noneCV,
  uintCV,
} from "@stacks/transactions";
import { config } from "./config.js";

export type OwnerMintParams = {
  // Contract address of the post
  contract: string;
  // Number of tokens to mint.
  amount: number | bigint;
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
  networkName,
}: {
  params: OwnerMintParams;
  network: StacksNetwork;
  networkName: StacksNetworkName;
}): Promise<OwnerMintReturn> => {
  const protocolAddress = config[networkName].protocolAddress;
  const [contractAddress, contractName] = params.contract.split(".");
  const minterData = await fetchCallReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: "get-minter",
    functionArgs: [],
    network,
    senderAddress: protocolAddress,
  });

  if (!(minterData.type === "ok" && minterData.value.type === "contract")) {
    throw new Error("Invalid minter data");
  }
  const minterContract = minterData.value.value;
  const [minterContractAddress, minterContractName] = minterContract.split(".");

  return {
    parameters: {
      contractAddress: minterContractAddress,
      contractName: minterContractName,
      functionName: "owner-mint",
      functionArgs: [
        contractPrincipalCV(contractAddress, contractName),
        uintCV(params.amount),
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
