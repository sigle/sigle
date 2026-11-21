import { DateTime, Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { SigleApi } from "@/api";
import { CurrentUser } from "@/api/middleware/auth-user";
import { Database } from "@/db";
import {
  findPublishUsage,
  getUserPlanOrFree,
  PUBLISH_LIMITS,
} from "@/services/plan";

export const getMe = Effect.gen(function* () {
  const user = yield* CurrentUser;
  const plan = yield* getUserPlanOrFree(user.id);

  return {
    id: user.id,
    address: user.address,
    whitelisted: user.whitelisted,
    plan,
  };
});

export const getLimits = Effect.gen(function* () {
  const user = yield* CurrentUser;
  const db = yield* Database;
  const plan = yield* getUserPlanOrFree(user.id);

  const usage = yield* findPublishUsage(db, {
    userId: user.id,
    now: new Date(),
  });

  return {
    publish: {
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
  (handlers) =>
    handlers.handle("get", () => getMe).handle("limits", () => getLimits),
);
