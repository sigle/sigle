import {
  IconCircleCheck,
  IconCircle,
  IconAlertCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Spinner } from "../../ui/spinner";

interface MultiStepToastProps {
  steps: {
    id: string;
    title: string;
    description?: string;
    status: "idle" | "pending" | "success" | "error";
    errorMessage?: string;
  }[];
  className?: string;
}

export const MultiStepToast = ({ steps, className }: MultiStepToastProps) => {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {steps.map((step) => {
        return (
          <div key={step.id}>
            <div className="flex items-center gap-2">
              {step.status === "pending" ? (
                <Spinner className="size-4" />
              ) : (
                <div className="flex size-4 items-center justify-center rounded-full">
                  {step.status === "idle" && (
                    <IconCircle size={16} className="text-muted-foreground" />
                  )}
                  {step.status === "success" && <IconCircleCheck size={16} />}
                  {step.status === "error" && (
                    <IconAlertCircle size={16} className="text-destructive" />
                  )}
                </div>
              )}
              <p
                className={cn("text-sm", {
                  "text-muted-foreground": step.status === "idle",
                  "font-medium": step.status === "pending",
                  "text-destructive": step.status === "error",
                })}
              >
                {step.title}
              </p>
            </div>
            {step.status === "error" && step.errorMessage ? (
              <p className="ml-6 text-xs text-destructive">
                {step.errorMessage}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
