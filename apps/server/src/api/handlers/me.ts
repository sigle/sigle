import { DateTime, Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { SigleApi } from "@/api";
import { CurrentUser } from "@/api/middleware/auth-user";
import { InternalServerError } from "@/api/schemas";
import { Database } from "@/db";
import {
  findUserPublishUsage,
  PlanService,
  PUBLISH_LIMITS,
} from "@/services/plan";

export const getMe = Effect.gen(function* () {
  const user = yield* CurrentUser;

  return {
    id: user.id,
    address: user.address,
    plan: user.plan,
  };
});

const toDailyLimit = (
  limit: number,
  usage: { readonly used: number; readonly resetsAt: Date | null },
) => ({
  limit,
  used: usage.used,
  resetsAt:
    usage.resetsAt === null ? null : DateTime.fromDateUnsafe(usage.resetsAt),
});

export const getLimits = Effect.gen(function* () {
  const user = yield* CurrentUser;
  const db = yield* Database;
  const now = new Date();

  const publish = yield* findUserPublishUsage(db, { userId: user.id, now });

  return {
    publish: toDailyLimit(PUBLISH_LIMITS[user.plan], publish),
  };
});

export const refreshPlan = Effect.gen(function* () {
  const user = yield* CurrentUser;
  const plans = yield* PlanService;

  const plan = yield* plans.checkUserPlan(user.id).pipe(
    Effect.tapError((error) =>
      Effect.logWarning("Failed to refresh the user plan", { cause: error }),
    ),
    Effect.mapError(
      () =>
        new InternalServerError({
          message: "Failed to check your wallet, please try again.",
        }),
    ),
  );

  return { plan };
});

export const MeHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "me",
  (handlers) =>
    handlers
      .handle("get", () => getMe)
      .handle("limits", () => getLimits)
      .handle("refreshPlan", () => refreshPlan),
);
