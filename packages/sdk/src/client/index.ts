import {
  type StacksNetwork,
  type StacksNetworkName,
  STACKS_MAINNET,
} from '@stacks/network';
import { mint, type MintParams } from './mint.js';
import {
  generatePostContract,
  type GeneratePostParams,
} from './generate-post-contract.js';
import { config, fixedMintFeeFree, fixedMintFeePaid } from './config.js';

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
      ? 'mainnet'
      : 'testnet';

  return {
    mint: (params: MintParams) => mint({ network: options.network, params }),
    generatePostContract: (params: GeneratePostParams) =>
      generatePostContract({
        params,
        network: options.network,
        networkName,
      }),
  };
};
export { config as sigleConfig, fixedMintFeeFree, fixedMintFeePaid };
