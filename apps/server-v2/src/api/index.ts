import { HttpApi, OpenApi } from "effect/http-api";
import { AdminGroup } from "@/api/groups/admin";
import { DraftsGroup } from "@/api/groups/drafts";
import { HealthGroup } from "@/api/groups/health";
import { MeGroup } from "@/api/groups/me";
import { PostsGroup } from "@/api/groups/posts";
import { ProfileGroup } from "@/api/groups/profile";
import { UsersGroup } from "@/api/groups/users";
import { SchemaErrorMiddleware } from "@/api/middleware/schema-error";
import { documentParameters, omitBadRequestWithoutInputs } from "@/api/schemas";
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
        "API of Sigle, a decentralized blogging platform on Stacks. Posts and profiles are signed by the author's wallet and stored on Arweave.\n\nAuthenticated routes need the session cookie set by signing in with Stacks through the Better Auth routes under `/api/auth`, which this document does not cover: `POST /api/auth/siws/nonce` returns a nonce to sign, `POST /api/auth/siws/verify` checks the signed message and sets the session cookie, `GET /api/auth/get-session` reads the session, and `POST /api/auth/sign-out` ends it.",
      transform: (spec) =>
        omitBadRequestWithoutInputs(documentParameters(spec)),
    }),
  );
