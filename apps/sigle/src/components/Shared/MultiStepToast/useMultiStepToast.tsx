import { toast } from "sonner";
import { MultiStepToast } from "./MultiStepToast";
import {
  type MultiStepToastStep,
  type StepStatus,
  useMultiStepToastStore,
} from "./store";

interface UseMultiStepToastOptions {
  steps: { id: string; title: string; description?: string }[];
  onError?: (error: Error, stepId: string) => void;
}

interface UseMultiStepToastReturn {
  start: () => void;
  completeStep: (id: string) => void;
  setStepLoading: (id: string) => void;
  setStepError: (id: string, errorMessage: string) => void;
  setAllComplete: () => void;
  dismiss: () => void;
}

export function useMultiStepToast(
  options: UseMultiStepToastOptions,
): UseMultiStepToastReturn {
  const { steps: stepDefinitions, onError } = options;
  const { toastId, setToastId, setSteps, updateStep, reset } =
    useMultiStepToastStore();

  const renderToast = () => {
    const { steps } = useMultiStepToastStore.getState();
    toast(() => <MultiStepToast steps={steps} />, {
      id: toastId ?? undefined,
    });
  };

  const initializeSteps = (): MultiStepToastStep[] => {
    return stepDefinitions.map((step, index) => ({
      ...step,
      status: index === 0 ? ("pending" as const) : ("idle" as const),
    }));
  };

  const start = () => {
    const initialSteps = initializeSteps();
    setSteps(initialSteps);

    const id = toast(() => <MultiStepToast steps={initialSteps} />, {
      duration: Infinity,
      closeButton: false,
    });
    setToastId(id);
  };

  const completeStep = (id: string) => {
    updateStep(id, { status: "success" });
    renderToast();
  };

  const setStepLoading = (id: string) => {
    updateStep(id, { status: "pending" });
    renderToast();
  };

  const setStepError = (id: string, errorMessage: string) => {
    updateStep(id, { status: "error", errorMessage });
    renderToast();
    onError?.(new Error(errorMessage), id);
  };

  const setAllComplete = () => {
    const allCompleteSteps = stepDefinitions.map((step) => ({
      ...step,
      status: "success" as StepStatus,
    }));
    setSteps(allCompleteSteps);
    renderToast();
  };

  const dismiss = () => {
    reset();
    toast.dismiss(toastId ?? undefined);
  };

  return {
    start,
    completeStep,
    setStepLoading,
    setStepError,
    setAllComplete,
    dismiss,
  };
}
