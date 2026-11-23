/**
 * Posts a user can publish per day on each plan, shown in the upgrade copy.
 * The server enforces `PUBLISH_LIMITS` in `apps/server/src/services/plan.ts`,
 * keep both in sync.
 */
export const PUBLISH_LIMITS = {
  free: 3,
  pro: 20,
};

export interface PlanFeature {
  label: string;
  /** Shown after the label in a monospace font, such as a URL. */
  code?: string;
  isComingSoon?: boolean;
}

/** What each plan includes, shown on the home page and the Plan page. */
export const PLAN_FEATURES: Record<"free" | "pro", PlanFeature[]> = {
  free: [
    { label: "Unlimited writing on", code: "sigle.io/name.btc" },
    { label: "Permanent Arweave text archive" },
    { label: "Automatic Bitcoin OpenTimestamps (.ots) proof" },
    { label: "RSS feed" },
  ],
  pro: [
    { label: "Everything in Free" },
    { label: "Custom domain", isComingSoon: true },
    { label: "Upload images and cover images" },
    { label: "Verified Explorer Guild badge" },
    { label: "Early access to new features" },
  ],
};
