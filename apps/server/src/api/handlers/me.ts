import { DateTime, Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { SigleApi } from "@/api";
import { CurrentUser } from "@/api/middleware/auth-user";
import { Database } from "@/db";
import { findPublishUsage, PlanService, PUBLISH_LIMITS } from "@/services/plan";

export const getMe = Effect.gen(function* () {
  const user = yield* CurrentUser;
  const plans = yield* PlanService;
  const db = yield* Database;

  // The plan only decides which features the app shows, so a failed NFT lookup
  // reports `free` instead of failing the whole request. Failures are not
  // cached, so the next request retries the lookup.
  const plan = yield* plans
    .getUserPlan(user.id)
    .pipe(
      Effect.catchTag("NftHoldingsError", (error) =>
        Effect.as(
          Effect.logWarning("Failed to check the user plan", { cause: error }),
          "free" as const,
        ),
      ),
    );

  const usage = yield* findPublishUsage(db, {
    userId: user.id,
    now: new Date(),
  });

  return {
    id: user.id,
    address: user.address,
    whitelisted: user.whitelisted,
    plan,
    publishLimit: {
      limit: PUBLISH_LIMITS[plan],
      used: usage.used,
      resetsAt:
        usage.resetsAt === null
          ? null
          : DateTime.fromDateUnsafe(usage.resetsAt),
    },
  };
});

export const MeHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "me",
  (handlers) => handlers.handle("get", () => getMe),
);
