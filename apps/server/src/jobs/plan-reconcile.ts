import { and, eq, isNull, lt, or } from "drizzle-orm";
import { Effect, Layer, Schedule } from "effect";
import { Database } from "@/db";
import { user } from "@/db/schema";
import { PlanService } from "@/services/plan";

/** Pro users are re-checked twice a day. */
const RECONCILE_INTERVAL = "12 hours";

/**
 * Pro users checked more recently than this are skipped, so a restart, which
 * runs the reconciliation right away, does not check everyone again.
 */
export const PLAN_RECHECK_AFTER_MILLIS = 6 * 60 * 60 * 1000;

/**
 * Checks the NFT holdings of the Pro users again, so a user who sold their
 * Explorer Guild NFT goes back to Free within a day. A user whose check fails
 * stays on Pro until the next run. It never upgrades anyone: only activating
 * Pro on the Plan page does.
 */
export const reconcileUserPlans = Effect.gen(function* () {
  const db = yield* Database;
  const plans = yield* PlanService;

  const cutoff = new Date(Date.now() - PLAN_RECHECK_AFTER_MILLIS);

  const proUsers = yield* db
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        eq(user.plan, "pro"),
        or(isNull(user.planCheckedAt), lt(user.planCheckedAt, cutoff)),
      ),
    )
    .pipe(Effect.orDie);

  for (const { id } of proUsers) {
    yield* plans.findUserPlan(id).pipe(
      Effect.flatMap((plan) =>
        Effect.gen(function* () {
          // Only written while the user is still on Pro, so a user who went
          // back to Free since the query above is not upgraded.
          yield* db
            .update(user)
            .set({ plan, planCheckedAt: new Date() })
            .where(and(eq(user.id, id), eq(user.plan, "pro")))
            .pipe(Effect.orDie);

          if (plan === "free") {
            yield* Effect.logInfo("User moved back to the free plan", {
              userId: id,
            });
          }
        }),
      ),
      Effect.catchTag("NftHoldingsError", (error) =>
        Effect.logWarning("Failed to re-check a user plan", {
          userId: id,
          cause: error,
        }),
      ),
    );
  }
});

export const PlanReconcileLive = Layer.effectDiscard(
  reconcileUserPlans.pipe(
    Effect.catchCause((cause) =>
      Effect.logWarning("User plan reconciliation failed", cause),
    ),
    Effect.repeat(Schedule.spaced(RECONCILE_INTERVAL)),
    Effect.interruptible,
    Effect.forkScoped,
  ),
);
