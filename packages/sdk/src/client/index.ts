import {
  STACKS_MAINNET,
  type StacksNetwork,
  type StacksNetworkName,
} from "@stacks/network";
import type { GeneratePostParams } from "./wip/generate-post-contract.js";
import type { MintParams } from "./wip/mint.js";
import type { OwnerMintParams } from "./wip/ownerMint.js";
import type { SetBaseTokenUriParams } from "./wip/setBaseTokenUri.js";
import { config } from "./config.js";
import { type SetProfileParams, setProfile } from "./setProfile.js";
import { generatePostContract } from "./wip/generate-post-contract.js";
import { mint } from "./wip/mint.js";
import { ownerMint } from "./wip/ownerMint.js";
import { setBaseTokenUri } from "./wip/setBaseTokenUri.js";

interface CreateClientOptions {
  /**
   * The Stacks network to use for the client.
   */
  network: StacksNetwork;
  /**
   * All the chainId for devnet, testnet and mocknet are the same, so we need to pass the network name as a workaround for now
   */
  networkName?: StacksNetworkName;
}

export const createClient = (options: CreateClientOptions) => {
  const networkName = options.networkName
    ? options.networkName
    : options.network.chainId === STACKS_MAINNET.chainId
      ? "mainnet"
      : "testnet";

  return {
    setProfile: (params: SetProfileParams) =>
      setProfile({
        params,
        network: options.network,
        networkName,
      }),
    WIP: {
      mint: (params: MintParams) =>
        mint({ network: options.network, networkName, params }),
      ownerMint: (params: OwnerMintParams) =>
        ownerMint({ network: options.network, params }),
      generatePostContract: (params: GeneratePostParams) =>
        generatePostContract({
          params,
          network: options.network,
          networkName,
        }),
      setBaseTokenUri: (params: SetBaseTokenUriParams) =>
        setBaseTokenUri({
          params,
          network: options.network,
        }),
    },
  };
};
export { config as sigleConfig };
