import type { CallContractParams } from "@stacks/connect/dist/types/methods.js";
import type { StacksNetworkName } from "@stacks/network";
import { stringAsciiCV } from "@stacks/transactions";
import { config } from "./config.js";

export interface PublishPostParams {
  // Metadata URL of the post to publish (e.g., IPFS URL or other content URL)
  metadataUri: string;
}

export interface PublishPostReturn {
  // Parameters to pass to the stacks.js contract call
  parameters: CallContractParams;
}

export const publishPost = ({
  params,
  networkName,
}: {
  params: PublishPostParams;
  networkName: StacksNetworkName;
}): PublishPostReturn => {
  const registryAddress = config[networkName].registryAddress;

  return {
    parameters: {
      contract: registryAddress,
      functionName: "publish-post",
      functionArgs: [stringAsciiCV(params.metadataUri)],
      postConditionMode: "deny",
      network: networkName,
    },
  };
};
