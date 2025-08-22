import { request } from "@stacks/connect";
import type {
  CallContractParams,
  TransactionResult,
} from "@stacks/connect/dist/types/methods";
import { useCallback, useState } from "react";
import { stacksNetwork } from "@/lib/stacks";

interface UseContractCallOptions {
  onSuccess?: (data: TransactionResult) => void;
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
    async (parameters: Omit<CallContractParams, "network" | "sponsored">) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          success: false,
          txId: null,
        }));

        // TODO onCancel and onSuccess
        const response = await request("stx_callContract", parameters);

        console.log("response", response);

        setState((prev) => ({
          ...prev,
          loading: false,
          success: true,
          txId: response.txid,
        }));
        onSuccess?.(response);

        // await openContractCall({
        //   ...parameters,
        //   network: stacksNetwork,
        //   onFinish: (data) => {
        //     setState((prev) => ({
        //       ...prev,
        //       loading: false,
        //       success: true,
        //       txId: data.txId,
        //     }));
        //     onSuccess?.(data);
        //   },
        //   onCancel: () => {
        //     setState((prev) => ({
        //       ...prev,
        //       loading: false,
        //     }));
        //     onCancel?.();
        //   },
        // });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // TODO this is not working for now
        if (errorMessage.endsWith("User denied transaction")) {
          onCancel?.();
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
    contractCall,
    reset,
    ...state,
  };
}
