import { create } from "zustand";

export type StepStatus = "idle" | "pending" | "success" | "error";

export interface MultiStepToastStep {
  title: string;
  description?: string;
  status: StepStatus;
  errorMessage?: string;
}

interface MultiStepToastState {
  toastId: string | number | null;
  steps: MultiStepToastStep[];
  setToastId: (toastId: string | number | null) => void;
  setSteps: (steps: MultiStepToastStep[]) => void;
  updateStep: (index: number, updates: Partial<MultiStepToastStep>) => void;
  reset: () => void;
}

export const useMultiStepToastStore = create<MultiStepToastState>()((set) => ({
  toastId: null,
  steps: [],
  setToastId: (toastId) => set(() => ({ toastId })),
  setSteps: (steps) => set(() => ({ steps })),
  updateStep: (index, updates) =>
    set((state) => ({
      steps: state.steps.map((step, i) =>
        i === index ? { ...step, ...updates } : step,
      ),
    })),
  reset: () => set({ toastId: null, steps: [] }),
}));
