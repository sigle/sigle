import {
  STACKS_MAINNET,
  type StacksNetwork,
  type StacksNetworkName,
} from "@stacks/network";
import { config } from "./config.js";
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
    setProfile: (params: SetProfileParams) =>
      setProfile({
        params,
        network: options.network,
        networkName,
      }),
  };
};
export { config as sigleConfig };
