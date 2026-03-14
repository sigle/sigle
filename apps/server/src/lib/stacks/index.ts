import type { paths as stacksApiPaths } from "@stacks/blockchain-api-client/lib/generated/schema";
import { createClient } from "@stacks/blockchain-api-client";
import { STACKS_DEVNET, STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";
import { Result } from "better-result";
import { env } from "@/env";
import { StacksApiError } from "./errors";

export const stacksNetwork =
  env.STACKS_ENV === "mainnet"
    ? STACKS_MAINNET
    : env.STACKS_ENV === "testnet"
      ? STACKS_TESTNET
      : STACKS_DEVNET;

export const stacksApiClient = createClient({
  baseUrl: `https://api.${env.STACKS_ENV}.hiro.so`,
});

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
