import {
  STACKS_MAINNET,
  type StacksNetwork,
  type StacksNetworkName,
} from "@stacks/network";
import { config, fixedMintFee } from "./config.js";
import {
  type GeneratePostParams,
  generatePostContract,
} from "./generate-post-contract.js";
import { type MintParams, mint } from "./mint.js";
import { OwnerMintParams, ownerMint } from "./ownerMint.js";
import { SetBaseTokenUriParams, setBaseTokenUri } from "./setBaseTokenUri.js";
import { type SetProfileParams, setProfile } from "./setProfile.js";

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
    setProfile: (params: SetProfileParams) =>
      setProfile({
        params,
        network: options.network,
        networkName,
      }),
    setBaseTokenUri: (params: SetBaseTokenUriParams) =>
      setBaseTokenUri({
        params,
        network: options.network,
      }),
  };
};
export { config as sigleConfig, fixedMintFee };
