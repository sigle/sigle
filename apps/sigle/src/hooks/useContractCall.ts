import {
  type ContractCallOptions,
  type FinishedTxData,
  openContractCall,
} from "@stacks/connect";
import { useCallback, useState } from "react";
import { stacksNetwork } from "@/lib/stacks";

interface UseContractCallOptions {
  onSuccess?: (data: FinishedTxData) => void;
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
      parameters: Omit<
        ContractCallOptions,
        "network" | "onFinish" | "onCancel" | "sponsored"
      >,
    ) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          success: false,
          txId: null,
        }));

        await openContractCall({
          ...parameters,
          network: stacksNetwork,
          onFinish: (data) => {
            setState((prev) => ({
              ...prev,
              loading: false,
              success: true,
              txId: data.txId,
            }));
            onSuccess?.(data);
          },
          onCancel: () => {
            setState((prev) => ({
              ...prev,
              loading: false,
            }));
            onCancel?.();
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: false,
        }));
        onError?.(errorMessage);
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
