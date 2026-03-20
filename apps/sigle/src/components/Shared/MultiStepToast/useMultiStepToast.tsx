import { toast } from "sonner";
import { MultiStepToast } from "./MultiStepToast";
import { type MultiStepToastStep, useMultiStepToastStore } from "./store";

interface UseMultiStepToastOptions<T extends string> {
  steps: readonly { id: T; title: string; description?: string }[];
  successMessage: string;
  onError?: (error: Error, stepId: T) => void;
}

interface UseMultiStepToastReturn<T extends string> {
  start: () => void;
  completeStep: (id: T) => void;
  setStepLoading: (id: T) => void;
  setStepError: (id: T, errorMessage: string) => void;
  dismiss: () => void;
}

export function useMultiStepToast<T extends string>(
  options: UseMultiStepToastOptions<T>,
): UseMultiStepToastReturn<T> {
  const toastId = "multi-step-toast";
  const { steps: stepDefinitions, successMessage, onError } = options;
  const { setSteps, updateStep, reset } = useMultiStepToastStore();

  const renderToast = () => {
    const { steps } = useMultiStepToastStore.getState();
    toast(() => <MultiStepToast steps={steps} />, {
      id: toastId,
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

    toast(() => <MultiStepToast steps={initialSteps} />, {
      id: toastId,
      duration: Infinity,
      closeButton: false,
    });
  };

  const completeStep = (id: T) => {
    const { steps } = useMultiStepToastStore.getState();
    const currentIndex = steps.findIndex((s) => s.id === id);
    const isLastStep = currentIndex === steps.length - 1;

    updateStep(id, { status: "success" });

    if (isLastStep) {
      renderToast();
      setTimeout(() => {
        dismiss();
        toast.success(successMessage);
      }, 500);
      return;
    }

    if (currentIndex !== -1) {
      const nextStep = steps[currentIndex + 1];
      updateStep(nextStep.id, { status: "pending" });
    }
    renderToast();
  };

  const setStepLoading = (id: T) => {
    updateStep(id, { status: "pending" });
    renderToast();
  };

  const setStepError = (id: T, errorMessage: string) => {
    updateStep(id, { status: "error", errorMessage });

    const { steps } = useMultiStepToastStore.getState();
    toast(() => <MultiStepToast steps={steps} />, {
      id: toastId,
      duration: Infinity,
      closeButton: true,
    });

    onError?.(new Error(errorMessage), id);
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
    dismiss,
  };
}
