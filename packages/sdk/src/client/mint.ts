import type { ContractCallBase } from "@stacks/connect";
import type { StacksNetwork, StacksNetworkName } from "@stacks/network";
import {
  contractPrincipalCV,
  fetchCallReadOnlyFunction,
  noneCV,
  PostConditionMode,
  uintCV,
} from "@stacks/transactions";
import { config, fixedMintFee } from "./config.js";

export type MintParams = {
  // Contract address of the post
  contract: string;
  // Number of tokens to mint.
  amount: number | bigint;
  // Refferal address to receive the referral fees
  referral?: string;
  // Address to receive the minted tokens
  recipient?: string;
  // Sender address, used for the post condditions
  sender: string;
  // Price of one token in satoshis
  price: string;
};

export type MintReturn = {
  // Parameters to pass to the stacks.js contract call
  parameters: ContractCallBase;
};

export const mint = async ({
  params,
  network,
  networkName,
}: {
  params: MintParams;
  network: StacksNetwork;
  networkName: StacksNetworkName;
}): Promise<MintReturn> => {
  const sBTCAsset = config[networkName].sBTCAsset;
  const [contractAddress, contractName] = params.contract.split(".");
  const minterData = await fetchCallReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: "get-minter",
    functionArgs: [],
    network,
    senderAddress: params.sender,
  });

  if (!(minterData.type === "ok" && minterData.value.type === "contract")) {
    throw new Error("Invalid minter data");
  }
  const minterContract = minterData.value.value;
  const [minterContractAddress, minterContractName] = minterContract.split(".");

  const totalFixedMintFee = fixedMintFee.total * BigInt(params.amount);
  const totalPrice =
    BigInt(params.price) * BigInt(params.amount) + totalFixedMintFee;

  return {
    parameters: {
      contractAddress: minterContractAddress,
      contractName: minterContractName,
      functionName: "mint",
      functionArgs: [
        contractPrincipalCV(contractAddress, contractName),
        uintCV(params.amount),
        params.referral
          ? contractPrincipalCV(params.referral, contractName)
          : noneCV(),
        params.recipient
          ? contractPrincipalCV(params.recipient, contractName)
          : noneCV(),
      ],
      postConditions: [
        {
          type: "ft-postcondition",
          address: params.sender,
          condition: "eq",
          asset: sBTCAsset,
          amount: totalPrice,
        },
      ],
      postConditionMode: PostConditionMode.Deny,
      network,
    },
  };
};
