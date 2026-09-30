import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { SigleApi } from "@/api";
import { JobAdminService } from "@/queue/admin";

export const getHealth = Effect.gen(function* () {
  const admin = yield* JobAdminService;

  return {
    success: true,
    queues: yield* admin.getSummary,
  };
});

export const HealthHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "health",
  (handlers) => handlers.handle("get", () => getHealth),
);
