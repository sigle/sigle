import { env } from '@/env';
import { AppConfig, UserSession } from '@stacks/connect';
import { STACKS_MAINNET, STACKS_TESTNET, STACKS_DEVNET } from '@stacks/network';
import { createClient } from '@stacks/blockchain-api-client';

export const appConfig = new AppConfig([]);
export const userSession = new UserSession({ appConfig });

export const stacksNetwork =
  env.NEXT_PUBLIC_STACKS_ENV === 'mainnet'
    ? STACKS_MAINNET
    : env.NEXT_PUBLIC_STACKS_ENV === 'testnet'
      ? STACKS_TESTNET
      : STACKS_DEVNET;

export const stacksApiClient = createClient({
  baseUrl: `https://api.${env.NEXT_PUBLIC_STACKS_ENV}.hiro.so`,
});

export const appDetails = {
  name: 'Sigle',
  icon: 'https://app.sigle.io/icon-192x192.png',
};

export const getExplorerTransactionUrl = (txId: string) =>
  `https://explorer.hiro.so/txid/${txId}?chain=${env.NEXT_PUBLIC_STACKS_ENV}`;

export const formatReadableAddress = (address: string) =>
  `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
