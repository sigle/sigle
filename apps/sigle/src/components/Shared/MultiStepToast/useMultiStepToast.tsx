import { toast } from "sonner";
import { MultiStepToast } from "./MultiStepToast";
import {
  type MultiStepToastStep,
  type StepStatus,
  useMultiStepToastStore,
} from "./store";

interface UseMultiStepToastOptions {
  steps: { title: string; description?: string }[];
  onError?: (error: Error, stepIndex: number) => void;
}

interface UseMultiStepToastReturn {
  start: () => void;
  completeStep: (index: number) => void;
  setStepLoading: (index: number) => void;
  setStepError: (index: number, errorMessage: string) => void;
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
    toast(toastId, () => <MultiStepToast steps={steps} />);
  };

  const initializeSteps = (): MultiStepToastStep[] => {
    return stepDefinitions.map((step, index) => ({
      ...step,
      // Set first element as pending when we start
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

  const completeStep = (index: number) => {
    updateStep(index, { status: "success" });
    renderToast();
  };

  const setStepLoading = (index: number) => {
    updateStep(index, { status: "pending" });
    renderToast();
  };

  const setStepError = (index: number, errorMessage: string) => {
    updateStep(index, { status: "error", errorMessage });
    renderToast();
    onError?.(new Error(errorMessage), index);
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
    toast.dismiss(toastId);
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
