import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import type { MultiStepToastStep } from "../MultiStepToast/store";
import { Spinner } from "../../ui/spinner";

interface MultiStepProps {
  steps: Array<MultiStepToastStep>;
  className?: string;
}

/** The progress of a task done in steps, such as publishing a post. */
export const MultiStep = ({ steps, className }: MultiStepProps) => {
  return (
    <ol className={cn("flex flex-col gap-3 text-sm", className)}>
      {steps.map((step) => (
        <li key={step.id}>
          <div className="flex items-center gap-3">
            <span className="flex size-4 shrink-0 items-center justify-center">
              {step.status === "idle" ? (
                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
              ) : null}
              {step.status === "pending" ? (
                <Spinner className="size-4" />
              ) : null}
              {step.status === "success" ? <IconCheck size={16} /> : null}
              {step.status === "error" ? (
                <IconAlertCircle size={16} className="text-destructive" />
              ) : null}
            </span>
            <span
              className={cn({
                "text-muted-foreground/70": step.status === "idle",
                "font-medium": step.status === "pending",
                "text-muted-foreground": step.status === "success",
                "text-destructive": step.status === "error",
              })}
            >
              {step.title}
            </span>
          </div>
          {step.status === "error" && step.errorMessage ? (
            <p className="mt-1 ml-7 text-xs text-destructive">
              {step.errorMessage}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
};
