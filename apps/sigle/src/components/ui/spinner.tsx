import { IconLoader } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <IconLoader
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
