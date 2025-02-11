import { useCallback, useState } from "react";
import {
  openContractDeploy,
  ContractDeployOptions,
  FinishedTxData,
} from "@stacks/connect";
import { appDetails, stacksNetwork, userSession } from "@/lib/stacks";

interface UseContractDeployOptions {
  onSuccess?: (data: FinishedTxData) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

interface ContractDeployState {
  loading: boolean;
  error: string | null;
  success: boolean;
  txId: string | null;
}

export function useContractDeploy(options: UseContractDeployOptions = {}) {
  const { onSuccess, onError, onCancel } = options;
  const [state, setState] = useState<ContractDeployState>({
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

  const contractDeploy = useCallback(
    async (
      parameters: Omit<
        ContractDeployOptions,
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

        await openContractDeploy({
          ...parameters,
          network: stacksNetwork,
          appDetails,
          userSession,
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
    contractDeploy,
    reset,
    ...state,
  };
}
