import type { ReactNode } from "react";
import { IconArrowUpRight, IconCheck } from "@tabler/icons-react";
import type { PlanFeature } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { appConfig } from "@/config";
import { PLAN_FEATURES } from "@/lib/plans";

const FeatureList = ({ features }: { features: Array<PlanFeature> }) => (
  <ul className="mt-6 mb-8 space-y-2 text-sm">
    {features.map((feature) => (
      <li key={feature.label} className="flex items-center gap-2">
        <IconCheck size={16} className="shrink-0 text-muted-foreground" />
        <span>
          {feature.label}
          {feature.code ? (
            <>
              {" "}
              <code className="font-mono text-[0.9em]">{feature.code}</code>
            </>
          ) : null}
        </span>
        {feature.isComingSoon ? (
          <span className="text-xs text-muted-foreground">Coming soon</span>
        ) : null}
      </li>
    ))}
  </ul>
);

const PlanTitle = ({
  children,
  isCurrent,
}: {
  children: string;
  isCurrent: boolean;
}) => (
  <h3 className="flex items-center gap-2">
    <span className="headline text-2xl">{children}</span>
    {isCurrent ? <Badge variant="secondary">Current plan</Badge> : null}
  </h3>
);

/**
 * The Free and Pro plans side by side, with `actions` at the bottom of each
 * column.
 */
export const PlanComparison = ({
  actions,
  currentPlan,
  onMarketplaceClick,
}: {
  actions: { free?: ReactNode; pro: ReactNode };
  /** Marks the user's plan, when signed in. */
  currentPlan?: "free" | "pro";
  onMarketplaceClick?: () => void;
}) => (
  <div className="grid overflow-hidden rounded-xl border border-border md:grid-cols-2">
    <div className="flex flex-col p-6 md:p-8">
      <PlanTitle isCurrent={currentPlan === "free"}>Free</PlanTitle>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything you need to start writing.
      </p>
      <FeatureList features={PLAN_FEATURES.free} />
      <div className="mt-auto">{actions.free}</div>
    </div>

    <div className="flex flex-col border-t border-border bg-secondary/40 p-6 md:border-t-0 md:border-l md:p-8">
      <PlanTitle isCurrent={currentPlan === "pro"}>Pro</PlanTitle>
      <p className="mt-1 text-sm text-muted-foreground">
        Unlocked by holding an{" "}
        <a
          href={appConfig.explorerGuildMarketplaceUrl}
          target="_blank"
          rel="noreferrer"
          onClick={onMarketplaceClick}
          className="inline-flex items-center gap-0.5 text-foreground underline-offset-4 hover:underline"
        >
          Explorer Guild NFT
          <IconArrowUpRight size={12} />
        </a>
        .
      </p>
      <FeatureList features={PLAN_FEATURES.pro} />
      <div className="mt-auto">{actions.pro}</div>
    </div>
  </div>
);
