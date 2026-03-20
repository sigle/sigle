import { toast } from "sonner";
import { MultiStepToast } from "./MultiStepToast";
import { useMultiStep } from "./useMultiStep";

interface UseMultiStepToastOptions<T extends string> {
  steps: readonly { id: T; title: string; description?: string }[];
  successMessage: string;
  onError?: (error: Error, stepId: T) => void;
}

interface UseMultiStepToastReturn<T extends string> {
  start: () => void;
  completeStep: (id: T) => void;
  setStepError: (id: T, errorMessage: string) => void;
  dismiss: () => void;
}

export function useMultiStepToast<T extends string>(
  options: UseMultiStepToastOptions<T>,
): UseMultiStepToastReturn<T> {
  const { steps: stepDefinitions, successMessage, onError } = options;
  const toastId = "multi-step-toast";

  const multiStep = useMultiStep({
    steps: stepDefinitions,
    onStepChange: () => {
      const { steps } = useMultiStepToastStore.getState();
      toast(toastId, () => <MultiStepToast steps={steps} />);
    },
  });

  const start = () => {
    multiStep.start();
    const { steps } = useMultiStepToastStore.getState();

    toast(() => <MultiStepToast steps={steps} />, {
      id: toastId,
      duration: Infinity,
      closeButton: false,
    });
  };

  const completeStep = (id: T) => {
    const { steps } = useMultiStepToastStore.getState();
    const currentIndex = steps.findIndex((s) => s.id === id);
    const isLastStep = currentIndex === steps.length - 1;

    multiStep.completeStep(id);

    if (isLastStep) {
      setTimeout(() => {
        multiStep.reset();
        toast.success(successMessage);
      }, 500);
      return;
    }

    const { steps: updatedSteps } = useMultiStepToastStore.getState();
    toast(toastId, () => <MultiStepToast steps={updatedSteps} />);
  };

  const setStepError = (id: T, errorMessage: string) => {
    multiStep.setStepError(id, errorMessage);
    const { steps } = useMultiStepToastStore.getState();

    toast(() => <MultiStepToast steps={steps} />, {
      id: toastId,
      duration: Infinity,
      closeButton: true,
    });

    onError?.(new Error(errorMessage), id);
  };

  const dismiss = () => {
    multiStep.reset();
    toast.dismiss(toastId);
  };

  return {
    start,
    completeStep,
    setStepError,
    dismiss,
  };
}

import { useMultiStepToastStore } from "./store";
