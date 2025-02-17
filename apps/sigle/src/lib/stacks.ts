import { env } from "@/env";
import { createClient } from "@stacks/blockchain-api-client";
import { AppConfig, UserSession } from "@stacks/connect";
import { STACKS_DEVNET, STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";

export const appConfig = new AppConfig([]);
export const userSession = new UserSession({ appConfig });

export const stacksNetwork =
  env.NEXT_PUBLIC_STACKS_ENV === "mainnet"
    ? STACKS_MAINNET
    : env.NEXT_PUBLIC_STACKS_ENV === "testnet"
      ? STACKS_TESTNET
      : STACKS_DEVNET;

export const stacksApiClient = createClient({
  baseUrl: `https://api.${env.NEXT_PUBLIC_STACKS_ENV}.hiro.so`,
});

export const appDetails = {
  name: "Sigle",
  icon: "https://app.sigle.io/icon-192x192.png",
};

export const getExplorerTransactionUrl = (txId: string) =>
  `https://explorer.hiro.so/txid/${txId}?chain=${env.NEXT_PUBLIC_STACKS_ENV}`;

export const formatReadableAddress = (address: string) =>
  `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

/**
 * Returns a promise that resolves when the transaction is confirmed
 */
export const getPromiseTransactionConfirmation = (txId: string) => {
  return new Promise((resolve, reject) => {
    const checkTransaction = async () => {
      try {
        const data = await stacksApiClient.GET("/extended/v1/tx/{tx_id}", {
          params: {
            path: {
              tx_id: txId,
            },
          },
        });

        if (data.data?.tx_status === "pending") {
          setTimeout(checkTransaction, 5000);
        } else if (data.data?.tx_status === "success") {
          resolve("Transaction confirmed");
        } else {
          reject("Transaction failed");
        }
      } catch (error) {
        reject(error);
      }
    };

    checkTransaction();
  });
};
