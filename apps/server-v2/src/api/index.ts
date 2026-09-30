import { HttpApi } from "effect/unstable/httpapi";
import { AdminGroup } from "@/api/groups/admin";
import { DraftsGroup } from "@/api/groups/drafts";
import { HealthGroup } from "@/api/groups/health";
import { ProfileGroup } from "@/api/groups/profile";
import { ProtectedGroup } from "@/api/groups/protected";

export const SigleApi = HttpApi.make("sigle")
  .add(HealthGroup)
  .add(ProtectedGroup)
  .add(DraftsGroup)
  .add(ProfileGroup)
  .add(AdminGroup);
