/**
 * Posts a user can publish per day on each plan, shown in the upgrade copy.
 * The server enforces `PUBLISH_LIMITS` in `apps/server/src/services/plan.ts`,
 * keep both in sync.
 */
export const PUBLISH_LIMITS = {
  free: 3,
  pro: 20,
};

const KIB = 1024;

const MIB = 1024 * KIB;

/**
 * Largest post a user can publish on each plan, in UTF-8 bytes of the signed
 * metadata JSON. The server enforces `PUBLISH_MAX_BYTES` in
 * `apps/server/src/services/plan.ts`, keep both in sync.
 */
export const PUBLISH_MAX_BYTES = {
  free: 256 * KIB,
  pro: 1 * MIB,
};

/**
 * A size in bytes as KiB, or MiB from 1 MiB, rounded up so a size over a
 * limit never reads as the limit: "256 KiB", "1.1 MiB". The server words its
 * size errors the same way.
 */
export const formatPublishSize = (bytes: number): string =>
  bytes >= MIB
    ? `${Math.ceil((bytes / MIB) * 10) / 10} MiB`
    : `${Math.ceil(bytes / KIB)} KiB`;

export interface PlanFeature {
  label: string;
  /** Shown after the label in a monospace font, such as a URL. */
  code?: string;
  isComingSoon?: boolean;
}

/** What each plan includes, shown on the home page and the Plan page. */
export const PLAN_FEATURES: Record<"free" | "pro", Array<PlanFeature>> = {
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
