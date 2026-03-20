import type { paths as stacksApiPaths } from "@stacks/blockchain-api-client/lib/generated/schema";
import { createClient } from "@stacks/blockchain-api-client";
import { STACKS_DEVNET, STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";
import { Result } from "better-result";
import { env } from "@/env";
import { StacksApiError } from "./errors";

export const stacksNetwork =
  env.NEXT_PUBLIC_STACKS_ENV === "mainnet"
    ? STACKS_MAINNET
    : env.NEXT_PUBLIC_STACKS_ENV === "testnet"
      ? STACKS_TESTNET
      : STACKS_DEVNET;

export const stacksApiClient = createClient({
  baseUrl: `https://api.${env.NEXT_PUBLIC_STACKS_ENV}.hiro.so`,
});

export const getExplorerTransactionUrl = (txId: string) =>
  `https://explorer.hiro.so/txid/${txId}?chain=${env.NEXT_PUBLIC_STACKS_ENV}`;

export const formatReadableAddress = (address: string) =>
  `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

export async function getStacksTransaction(
  txId: string,
): Promise<
  Result<
    stacksApiPaths["/extended/v1/tx/{tx_id}"]["get"]["responses"]["200"]["content"]["application/json"],
    Error
  >
> {
  return Result.tryPromise({
    try: async () => {
      const txResult = await stacksApiClient.GET("/extended/v1/tx/{tx_id}", {
        params: {
          path: {
            tx_id: txId,
          },
          query: {
            event_limit: 0,
            exclude_function_args: true,
          },
        },
      });
      if (txResult.error) {
        throw new StacksApiError({
          cause: txResult.error.error,
        });
      }

      return txResult.data;
    },
    catch: (e) => (StacksApiError.is(e) ? e : new StacksApiError({ cause: e })),
  });
}

/**
 * Returns a promise that resolves when the transaction is confirmed
 */
export async function getPromiseTransactionConfirmation(txId: string) {
  return new Promise((resolve, reject) => {
    const checkTransaction = async () => {
      try {
        const data = await getStacksTransaction(txId);
        if (data.isErr()) {
          reject("Transaction failed");
          return;
        } else if (data.value.tx_status === "pending") {
          setTimeout(checkTransaction, 5000);
        } else if (data.value.tx_status === "success") {
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
}
