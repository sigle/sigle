import { HttpApi } from "effect/unstable/httpapi";
import { DraftsGroup } from "@/api/groups/drafts";
import { HealthGroup } from "@/api/groups/health";
import { ProtectedGroup } from "@/api/groups/protected";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";

export const SigleApi = HttpApi.make("sigle")
  .add(HealthGroup)
  .add(ProtectedGroup)
  .add(DraftsGroup)
  .middleware(RateLimitMiddleware);
