import type { DeployContractParams } from "@stacks/connect/dist/types/methods";
import { request } from "@stacks/connect";
import { useCallback, useState } from "react";

interface UseContractDeployOptions {
  onSuccess?: (data: { txId: string }) => void;
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
    async (parameters: Omit<DeployContractParams, "network" | "sponsored">) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          success: false,
          txId: null,
        }));

        const response = await request("stx_deployContract", parameters);

        setState((prev) => ({
          ...prev,
          loading: false,
          success: true,
          // oxlint-disable-next-line no-non-null-assertion
          txId: response.txid!,
        }));
        onSuccess?.({
          // oxlint-disable-next-line no-non-null-assertion
          txId: response.txid!,
        });
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
          return;
        }

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
