import { HttpApi } from "effect/unstable/httpapi";
import { HealthGroup } from "@/api/groups/health";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";

export const SigleApi = HttpApi.make("sigle")
  .add(HealthGroup)
  .middleware(RateLimitMiddleware);
