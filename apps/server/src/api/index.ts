import { HttpApi, OpenApi } from "effect/http-api";
import { AdminGroup } from "@/api/groups/admin";
import {
  DRAFT_CONTENT_TOTAL_MAX_MIB,
  DRAFT_COUNT_LIMIT,
  DraftsGroup,
} from "@/api/groups/drafts";
import { HealthGroup } from "@/api/groups/health";
import { MeGroup } from "@/api/groups/me";
import { PostsGroup } from "@/api/groups/posts";
import { ProfileGroup } from "@/api/groups/profile";
import { UsersGroup } from "@/api/groups/users";
import { PUBLIC_CACHE_CONTROL } from "@/api/middleware/etag";
import { RATE_LIMITS } from "@/api/middleware/rate-limit";
import { SchemaErrorMiddleware } from "@/api/middleware/schema-error";
import {
  omitBadRequestWithoutInputs,
  promoteSchemaDescriptions,
} from "@/api/schemas";
import {
  SECURE_SESSION_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/services/auth";
import {
  formatPublishSize,
  PUBLISH_LIMITS,
  PUBLISH_MAX_BYTES,
} from "@/services/plan";
import packageJson from "../../package.json" with { type: "json" };

const API_DESCRIPTION = [
  "REST API for **Sigle**, a decentralized blogging platform built on Stacks and Arweave. Posts are signed by the author's Stacks wallet, stored permanently on Arweave, and timestamped on Bitcoin with OpenTimestamps. Profiles are managed on Sigle and can be prefilled from a BNS V2 zonefile.",
  "",
  "## Authentication",
  "",
  `Public endpoints (\`Posts\`, \`Users\`, and \`Health\`) require no authentication. Authenticated endpoints (\`Account\`, \`Profile\`, and \`Drafts\`) require the session cookie (\`${SECURE_SESSION_COOKIE_NAME}\` over HTTPS, or \`${SESSION_COOKIE_NAME}\` over plain HTTP in local development) and return \`401 Unauthorized\` when missing or expired.`,
  "",
  "Sessions are managed through Better Auth's Sign in with Stacks (SIWS) routes under `/api/auth` (outside this specification):",
  "",
  "- `POST /api/auth/siws/nonce` — Issue a one-time nonce to sign with a Stacks wallet.",
  "- `POST /api/auth/siws/verify` — Verify the signed message and set the session cookie.",
  "- `GET /api/auth/get-session` — Inspect the active session.",
  "- `POST /api/auth/sign-out` — Revoke the active session.",
  "",
  "## Rate Limiting",
  "",
  `All routes except \`GET /health\` enforce a global per-IP limit of **${RATE_LIMITS.global.points} requests/minute**, plus per-endpoint fixed-window limits (keyed by authenticated user ID, or by client IP when unauthenticated). The default endpoint limit is **${RATE_LIMITS.default.points} requests/minute**, with stricter limits on write and external-API operations:`,
  "",
  "| Operation | Limit |",
  "| --- | --- |",
  `| Default endpoints | ${RATE_LIMITS.default.points} req/min |`,
  `| Draft image uploads | ${RATE_LIMITS.draftImageUpload.points} req/min |`,
  `| Profile updates | ${RATE_LIMITS.profileUpdate.points} req/min |`,
  `| BNS profile preview & plan refresh | ${RATE_LIMITS.bnsProfileImport.points} req/min |`,
  `| Draft publishing & profile image uploads | ${RATE_LIMITS.draftPublish.points} req/min |`,
  "",
  "Responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` (Unix timestamp in seconds). Exceeding a limit returns `429 Too Many Requests` with a `Retry-After` header (seconds) and `retryAfterMillis` in the JSON body.",
  "",
  "## Caching",
  "",
  `Public read endpoints (\`GET /api/posts\`, \`GET /api/posts/{postId}\`, \`GET /api/users/{address}\`) return \`Cache-Control: ${PUBLIC_CACHE_CONTROL}\` and a strong \`ETag\` computed from the response body. Send \`If-None-Match\` to receive \`304 Not Modified\` while unchanged.`,
  "",
  "## Pagination",
  "",
  "Paginated list endpoints accept `limit` and `offset` query parameters and return `{ results, limit, offset, total }`.",
  "",
  "## Plans & Quotas",
  "",
  "Accounts start on the **Free** plan and unlock **Pro** by holding an Explorer Guild NFT in any linked Stacks wallet (activated via `POST /api/me/plan/refresh` and re-checked automatically twice a day).",
  "",
  "| Quota | Free | Pro |",
  "| --- | --- | --- |",
  `| Publishes per rolling 24h | ${PUBLISH_LIMITS.free} | ${PUBLISH_LIMITS.pro} |`,
  `| Max signed post metadata size | ${formatPublishSize(PUBLISH_MAX_BYTES.free)} | ${formatPublishSize(PUBLISH_MAX_BYTES.pro)} |`,
  "| Draft image uploads | Not included | Included (up to 5 MiB) |",
  `| Draft count / total content | ${DRAFT_COUNT_LIMIT} drafts / ${DRAFT_CONTENT_TOTAL_MAX_MIB} MiB | ${DRAFT_COUNT_LIMIT} drafts / ${DRAFT_CONTENT_TOTAL_MAX_MIB} MiB |`,
  "",
  "## Errors",
  "",
  "Errors use standard HTTP status codes with a JSON `{ message }` payload. Rate-limit (`429`) and transient backpressure (`503`) errors also include `retryAfterMillis` and a `Retry-After` header.",
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
      override: {
        externalDocs: {
          description: "Sigle Documentation",
          url: "https://docs.sigle.io",
        },
      },
      transform: (spec) =>
        omitBadRequestWithoutInputs(promoteSchemaDescriptions(spec)),
    }),
  );
