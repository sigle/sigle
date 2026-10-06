import { STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";
import { env } from "@/env";

const stacksNetworks = {
  mainnet: STACKS_MAINNET,
  testnet: STACKS_TESTNET,
};

export const stacksNetwork = stacksNetworks[env.NEXT_PUBLIC_STACKS_ENV];

export const getExplorerTransactionUrl = (txId: string) =>
  `https://explorer.hiro.so/txid/${txId}?chain=${env.NEXT_PUBLIC_STACKS_ENV}`;

export const formatReadableAddress = (address: string) =>
  `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
