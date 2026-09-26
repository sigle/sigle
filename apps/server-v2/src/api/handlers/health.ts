import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { SigleApi } from "@/api";

export const getHealth = () => Effect.succeed({ success: true });

export const HealthHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "health",
  (handlers) => handlers.handle("get", getHealth),
);
