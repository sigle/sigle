import type { ContractCallBase } from "@stacks/connect";
import type { StacksNetwork, StacksNetworkName } from "@stacks/network";
import { PostConditionMode, stringAsciiCV } from "@stacks/transactions";
import { config } from "./config.js";

export interface PublishPostParams {
  // URL of the post to publish (e.g., IPFS URL or other content URL)
  url: string;
}

export interface PublishPostReturn {
  // Parameters to pass to the stacks.js contract call
  parameters: ContractCallBase;
}

export const publishPost = ({
  params,
  network,
  networkName,
}: {
  params: PublishPostParams;
  network: StacksNetwork;
  networkName: StacksNetworkName;
}): PublishPostReturn => {
  const protocolAddress = config[networkName].protocolAddress;

  return {
    parameters: {
      contractAddress: protocolAddress,
      contractName: "sigle-registry-v001",
      functionName: "publish-post",
      functionArgs: [stringAsciiCV(params.url)],
      postConditionMode: PostConditionMode.Deny,
      network,
    },
  };
};
