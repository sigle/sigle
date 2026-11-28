import { HttpApi, OpenApi } from "effect/http-api";
import { AdminGroup } from "@/api/groups/admin";
import { DraftsGroup } from "@/api/groups/drafts";
import { HealthGroup } from "@/api/groups/health";
import { MeGroup } from "@/api/groups/me";
import { PostsGroup } from "@/api/groups/posts";
import { ProfileGroup } from "@/api/groups/profile";
import { UsersGroup } from "@/api/groups/users";
import { SchemaErrorMiddleware } from "@/api/middleware/schema-error";
import {
  omitBadRequestWithoutInputs,
  promoteSchemaDescriptions,
  withApiContact,
} from "@/api/schemas";
import { SECURE_SESSION_COOKIE_NAME } from "@/services/auth";
import packageJson from "../../package.json" with { type: "json" };

const API_DESCRIPTION = [
  "REST API for **Sigle**, a decentralized blogging platform built on Stacks and Arweave. Posts are signed by the author's Stacks wallet, stored permanently on Arweave, and timestamped on Bitcoin with OpenTimestamps.",
  "",
  "## Authentication",
  "",
  `Public endpoints (\`Posts\`, \`Users\`, and \`Health\`) require no authentication. Authenticated endpoints (\`Account\`, \`Profile\`, and \`Drafts\`) require a valid session cookie (\`${SECURE_SESSION_COOKIE_NAME}\`) and return \`401 Unauthorized\` when missing or expired.`,
  "",
  "Sessions are managed via Sign in with Stacks (SIWS) routes under `/api/auth` (outside this specification):",
  "",
  "- `POST /api/auth/siws/nonce` — Issue a one-time nonce to sign with a Stacks wallet.",
  "- `POST /api/auth/siws/verify` — Verify the signed message and establish a session cookie.",
  "- `GET /api/auth/get-session` — Inspect the active session.",
  "- `POST /api/auth/sign-out` — End the active session.",
  "",
  "## Rate Limiting",
  "",
  "API endpoints are rate-limited. Responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` (Unix timestamp in seconds). Exceeding a limit returns `429 Too Many Requests` with a `Retry-After` header (seconds) and `retryAfterMillis` in the JSON body.",
  "",
  "## Caching",
  "",
  "Public read endpoints (`GET /api/posts`, `GET /api/posts/{postId}`, `GET /api/users/{address}`) return `Cache-Control` and `ETag` headers. Send `If-None-Match` to receive `304 Not Modified` while unchanged.",
  "",
  "## Pagination",
  "",
  "Paginated list endpoints accept `limit` and `offset` query parameters and return `{ results, limit, offset, total }`.",
  "",
  "## Plans & Quotas",
  "",
  "Accounts start on the **Free** plan and unlock **Pro** by holding an Explorer Guild NFT (call `POST /api/me/plan/refresh` to update). Pro increases publishing quotas and unlocks draft image uploads. Use `GET /api/me/limits` to inspect current quotas and usage.",
  "",
  "## Errors",
  "",
  "Errors use standard HTTP status codes with a JSON `{ message }` payload. `429` and `503` responses also include `retryAfterMillis` and a `Retry-After` header.",
].join("\n");

export const SigleApi = HttpApi.make("sigle")
  .add(PostsGroup)
  .add(UsersGroup)
  .add(MeGroup)
  .add(ProfileGroup)
  .add(DraftsGroup)
  .add(HealthGroup)
  .add(AdminGroup)
  .middleware(SchemaErrorMiddleware)
  .annotateMerge(
    OpenApi.annotations({
      title: "Sigle API",
      summary: "Decentralized blogging API for Sigle on Stacks and Arweave.",
      // Changesets bumps the package version on each release.
      version: packageJson.version,
      description: API_DESCRIPTION,
      license: {
        name: "MIT",
        url: "https://github.com/sigle/sigle/blob/main/LICENSE",
      },
      override: {
        externalDocs: {
          description: "Sigle Documentation",
          url: "https://docs.sigle.io",
        },
      },
      transform: (spec) =>
        withApiContact({
          name: "Sigle",
          url: "https://www.sigle.io",
        })(omitBadRequestWithoutInputs(promoteSchemaDescriptions(spec))),
    }),
  );
