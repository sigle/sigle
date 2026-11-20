import { HttpApi } from "effect/http-api";
import { AdminGroup } from "@/api/groups/admin";
import { DraftsGroup } from "@/api/groups/drafts";
import { HealthGroup } from "@/api/groups/health";
import { PostsGroup } from "@/api/groups/posts";
import { ProfileGroup } from "@/api/groups/profile";
import { ProtectedGroup } from "@/api/groups/protected";
import { UsersGroup } from "@/api/groups/users";
import { SchemaErrorMiddleware } from "@/api/middleware/schema-error";

export const SigleApi = HttpApi.make("sigle")
  .add(HealthGroup)
  .add(ProtectedGroup)
  .add(DraftsGroup)
  .add(ProfileGroup)
  .add(UsersGroup)
  .add(PostsGroup)
  .add(AdminGroup)
  .middleware(SchemaErrorMiddleware);
