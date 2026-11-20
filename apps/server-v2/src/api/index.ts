import { HttpApi, OpenApi } from "effect/http-api";
import { AdminGroup } from "@/api/groups/admin";
import { DraftsGroup } from "@/api/groups/drafts";
import { HealthGroup } from "@/api/groups/health";
import { MeGroup } from "@/api/groups/me";
import { PostsGroup } from "@/api/groups/posts";
import { ProfileGroup } from "@/api/groups/profile";
import { UsersGroup } from "@/api/groups/users";
import { SchemaErrorMiddleware } from "@/api/middleware/schema-error";
import packageJson from "../../package.json" with { type: "json" };

export const SigleApi = HttpApi.make("sigle")
  .add(HealthGroup)
  .add(MeGroup)
  .add(DraftsGroup)
  .add(ProfileGroup)
  .add(UsersGroup)
  .add(PostsGroup)
  .add(AdminGroup)
  .middleware(SchemaErrorMiddleware)
  .annotateMerge(
    OpenApi.annotations({
      title: "Sigle API",
      // Changesets bumps the package version on each release.
      version: packageJson.version,
      description:
        "API of Sigle, a decentralized blogging platform on Stacks. Posts and profiles are signed by the author's wallet and stored on Arweave.",
    }),
  );
