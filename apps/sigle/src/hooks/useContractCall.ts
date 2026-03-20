import type { CallContractParams } from "@stacks/connect/dist/types/methods";
import { request } from "@stacks/connect";
import { Result, TaggedError } from "better-result";
import { useCallback, useState } from "react";

export class TransactionUserRejectedError extends TaggedError(
  "TransactionUserRejectedError",
)() {
  constructor() {
    super({ message: "User rejected the request" });
  }
}

export class ContractCallError extends TaggedError("ContractCallError")<{
  message: string;
}>() {}

interface UseContractCallOptions {
  onSuccess?: (data: { txId: string }) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

interface ContractCallState {
  loading: boolean;
  error: string | null;
  success: boolean;
  txId: string | null;
}

export function useContractCall(options: UseContractCallOptions = {}) {
  const { onSuccess, onError, onCancel } = options;
  const [state, setState] = useState<ContractCallState>({
    loading: false,
    error: null,
    success: false,
    txId: null,
  });

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      txId: null,
    });
  }, []);

  const contractCall = useCallback(
    async (
      parameters: Omit<CallContractParams, "network" | "sponsored">,
    ): Promise<
      Result<string, ContractCallError | TransactionUserRejectedError>
    > => {
      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          success: false,
          txId: null,
        }));

        const response = await request("stx_callContract", parameters);

        // For some reason, from time to time the txId is returned without the 0x prefix
        const txId = response.txid
          ? !response.txid.startsWith("0x")
            ? `0x${response.txid}`
            : response.txid
          : "";

        setState((prev) => ({
          ...prev,
          loading: false,
          success: true,
          txId: txId,
        }));
        onSuccess?.({
          txId: txId,
        });
        return Result.ok(txId);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // TODO this is not working for now
        if (errorMessage.endsWith("User denied transaction")) {
          setState((prev) => ({
            ...prev,
            loading: false,
          }));
          onCancel?.();
          return Result.err(new TransactionUserRejectedError());
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: false,
        }));
        onError?.(errorMessage);
        return Result.err(new ContractCallError({ message: errorMessage }));
      }
    },
    [onSuccess, onError, onCancel],
  );

  return {
    contractCall,
    reset,
    ...state,
  };
}
