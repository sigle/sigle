import type { paths as stacksApiPaths } from "@stacks/blockchain-api-client/lib/generated/schema";
import { createClient } from "@stacks/blockchain-api-client";
import { STACKS_DEVNET, STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";
import { Result } from "better-result";
import { env } from "@/env";
import { StacksApiError, TransactionTimeoutError } from "./errors";

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
    StacksApiError
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

export async function waitForTransaction(options: {
  txId: string;

  /**
   * Polling frequency (in ms).
   * @default 2000
   */
  pollingInterval?: number | undefined;
  /**
   * Optional timeout (in milliseconds) to wait before stopping polling.
   * @default 180_000
   */
  timeout?: number;
}): Promise<
  Result<
    stacksApiPaths["/extended/v1/tx/{tx_id}"]["get"]["responses"]["200"]["content"]["application/json"],
    StacksApiError | TransactionTimeoutError
  >
> {
  const { txId, pollingInterval = 2_000, timeout = 180_000 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const txResult = await getStacksTransaction(txId);

    if (txResult.isErr()) {
      return txResult;
    }

    if (txResult.value.tx_status !== "pending") {
      return txResult;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, pollingInterval);
    });
  }

  return Result.err(
    new TransactionTimeoutError({
      txId,
      message: `Transaction ${txId} timed out after ${timeout}ms`,
    }),
  );
}

export async function getPromiseTransactionConfirmation(
  txId: string,
): Promise<string> {
  const result = await waitForTransaction({ txId });

  if (result.isErr()) {
    throw new Error(result.error.message);
  }

  return "Transaction confirmed";
}
