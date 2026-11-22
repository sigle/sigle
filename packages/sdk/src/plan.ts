export type UserPlan = "free" | "pro";

/** Posts a user can publish per rolling 24 hours, by plan. */
export const PUBLISH_LIMITS: Record<UserPlan, number> = {
  free: 3,
  pro: 20,
};
