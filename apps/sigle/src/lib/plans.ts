/**
 * Posts a user can publish per day on each plan, shown in the upgrade copy.
 * The server enforces `PUBLISH_LIMITS` in `apps/server/src/services/plan.ts`,
 * keep both in sync.
 */
export const PUBLISH_LIMITS = {
  free: 3,
  pro: 20,
};
