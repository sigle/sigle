import { Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { SigleApi } from "@/api";
import { CurrentUser } from "@/api/middleware/auth-user";
import { PlanService } from "@/services/plan";

export const getMe = Effect.gen(function* () {
  const user = yield* CurrentUser;
  const plans = yield* PlanService;

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

  return { id: user.id, whitelisted: user.whitelisted, plan };
});

export const ProtectedHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "protected",
  (handlers) => handlers.handle("me", () => getMe),
);
