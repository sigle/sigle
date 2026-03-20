import { toast } from "sonner";
import { MultiStepToast } from "./MultiStepToast";
import { type MultiStepToastStep, useMultiStepToastStore } from "./store";

interface UseMultiStepToastOptions {
  steps: { id: string; title: string; description?: string }[];
  successMessage: string;
  onError?: (error: Error, stepId: string) => void;
}

interface UseMultiStepToastReturn {
  start: () => void;
  completeStep: (id: string) => void;
  setStepLoading: (id: string) => void;
  setStepError: (id: string, errorMessage: string) => void;
  dismiss: () => void;
}

export function useMultiStepToast(
  options: UseMultiStepToastOptions,
): UseMultiStepToastReturn {
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

  const completeStep = (id: string) => {
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

  const setStepLoading = (id: string) => {
    updateStep(id, { status: "pending" });
    renderToast();
  };

  const setStepError = (id: string, errorMessage: string) => {
    updateStep(id, { status: "error", errorMessage });
    renderToast();
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
