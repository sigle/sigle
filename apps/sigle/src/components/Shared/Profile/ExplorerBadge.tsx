import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";

/** The compass of the Pro welcome dialog, without its ticks and animation. */
const ExplorerSeal = ({ className }: { className: string }) => (
  <svg
    viewBox="0 0 44 44"
    fill="none"
    stroke="currentColor"
    strokeWidth={3.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-accent", className)}
    aria-hidden
  >
    <circle cx="22" cy="22" r="19" />
    <path
      d="M22 11l4.5 11L22 33l-4.5-11z"
      fill="currentColor"
      fillOpacity={0.25}
    />
    <path d="M22 11l4.5 11h-9z" fill="currentColor" />
  </svg>
);

interface ExplorerBadgeProps {
  /**
   * `seal` is the compass alone, to follow a name in a byline. `label` adds
   * "Explorer Guild", to say what the badge is on the profile page.
   */
  variant?: "seal" | "label";
  className?: string;
}

/** Shown next to users on Pro, which holding an Explorer Guild NFT unlocks. */
export const ExplorerBadge = ({
  variant = "seal",
  className,
}: ExplorerBadgeProps) => (
  <Tooltip>
    <TooltipTrigger
      aria-label={variant === "seal" ? "Explorer Guild member" : undefined}
      className={cn(
        "inline-flex shrink-0 cursor-default items-center rounded-4xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        variant === "label" &&
          "h-6 gap-1.5 border border-accent/45 pr-2.5 pl-2 text-xs font-medium",
        className,
      )}
    >
      <ExplorerSeal className={variant === "label" ? "size-3.5" : "size-4"} />
      {variant === "label" ? "Explorer Guild" : null}
    </TooltipTrigger>
    <TooltipContent>
      <span>
        <span className="block font-medium">Explorer Guild</span>
        Verified holder of an Explorer Guild NFT
      </span>
    </TooltipContent>
  </Tooltip>
);
