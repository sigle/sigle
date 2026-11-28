import { Schema } from "effect";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "effect/http-api";
import { MediaImage, PublicUser } from "@/api/groups/users";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";
import {
  BadRequest,
  ContentWarning,
  DateTime,
  documentPaginationQuery,
  NonNegativeInt,
  NotFound,
  paginationQueryFields,
  PublicCacheHeaders,
} from "@/api/schemas";
import { postOtsStatuses } from "@/db/schema";

export const POST_LIST_DEFAULT_LIMIT = 20;

export const POST_LIST_MAX_LIMIT = 100;

export const PostListItem = Schema.Struct({
  id: Schema.String.annotate({
    description: "Unique identifier of the post (its Arweave transaction ID).",
  }),
  title: Schema.String.annotate({
    description: "Title of the post.",
  }),
  excerpt: Schema.String.annotate({
    description: "Plain-text summary of the post shown in lists and previews.",
  }),
  metaTitle: Schema.NullOr(Schema.String).annotate({
    description: "Optional SEO title override, or `null` if unset.",
  }),
  metaDescription: Schema.NullOr(Schema.String).annotate({
    description: "Optional SEO meta description override, or `null` if unset.",
  }),
  coverImage: Schema.NullOr(MediaImage).annotate({
    description:
      "Cover image URL and placeholder metadata, or `null` if the post has no cover.",
  }),
  tags: Schema.Array(Schema.String).annotate({
    description: "List of topic tags attached to the post.",
  }),
  canonicalUri: Schema.NullOr(Schema.String).annotate({
    description:
      "Canonical URL of the original publication if syndicated, or `null`.",
  }),
  contentWarning: Schema.NullOr(ContentWarning).pipe(
    Schema.annotateEncoded({
      description:
        "Content warning label (`nsfw`, `sensitive`, `spoiler`), or `null`.",
    }),
  ),
  arweaveTxId: Schema.String.annotate({
    description:
      "Arweave transaction ID where the signed post metadata is stored.",
  }),
  createdAt: DateTime.pipe(
    Schema.annotateEncoded({
      description: "ISO 8601 timestamp when the post was published.",
    }),
  ),
  updatedAt: DateTime.pipe(
    Schema.annotateEncoded({
      description: "ISO 8601 timestamp when the post record was last updated.",
    }),
  ),
  author: PublicUser,
}).annotate({
  identifier: "PostListItem",
  description: "Summary of a published post returned in list endpoints.",
});

export const PostOpenTimestamps = Schema.Struct({
  status: Schema.Literals(["pending", "upgraded", "failed"])
    .transform(postOtsStatuses)
    .pipe(
      Schema.annotateEncoded({
        description:
          "OpenTimestamps anchoring state: `pending` while awaiting Bitcoin confirmation, `upgraded` once anchored in a Bitcoin block, or `failed` if stamping failed.",
      }),
    ),
  contentHash: Schema.String.annotate({
    description:
      "Hex-encoded SHA-256 digest of the signed post metadata JSON anchored by the proof.",
  }),
  otsTxId: Schema.NullOr(Schema.String).annotate({
    description:
      "Arweave transaction ID of the Bitcoin-anchored `.ots` proof file once `upgraded`, or `null`.",
  }),
  bitcoinBlockHeight: Schema.NullOr(NonNegativeInt).annotate({
    description:
      "Bitcoin block height containing the timestamp attestation once `upgraded`, or `null`.",
  }),
  bitcoinBlockHash: Schema.NullOr(Schema.String).annotate({
    description:
      "Bitcoin block hash containing the timestamp attestation once `upgraded`, or `null`.",
  }),
  bitcoinTimestamp: Schema.NullOr(DateTime).pipe(
    Schema.annotateEncoded({
      description:
        "ISO 8601 timestamp of the attesting Bitcoin block once `upgraded`, or `null`.",
    }),
  ),
}).annotate({
  identifier: "PostOpenTimestamps",
  description:
    "Bitcoin OpenTimestamps proof status and attestation metadata for a published post.",
});

export const Post = Schema.Struct({
  id: Schema.String.annotate({
    description: "Unique identifier of the post (its Arweave transaction ID).",
  }),
  title: Schema.String.annotate({
    description: "Title of the post.",
  }),
  content: Schema.String.annotate({
    description: "Full Markdown body of the post.",
  }),
  excerpt: Schema.String.annotate({
    description: "Plain-text summary of the post.",
  }),
  metaTitle: Schema.NullOr(Schema.String).annotate({
    description: "Optional SEO title override, or `null` if unset.",
  }),
  metaDescription: Schema.NullOr(Schema.String).annotate({
    description: "Optional SEO meta description override, or `null` if unset.",
  }),
  coverImage: Schema.NullOr(MediaImage).annotate({
    description:
      "Cover image URL and placeholder metadata, or `null` if the post has no cover.",
  }),
  tags: Schema.Array(Schema.String).annotate({
    description: "List of topic tags attached to the post.",
  }),
  canonicalUri: Schema.NullOr(Schema.String).annotate({
    description:
      "Canonical URL of the original publication if syndicated, or `null`.",
  }),
  contentWarning: Schema.NullOr(ContentWarning).pipe(
    Schema.annotateEncoded({
      description:
        "Content warning label (`nsfw`, `sensitive`, `spoiler`), or `null`.",
    }),
  ),
  metadataUri: Schema.String.annotate({
    description:
      "URI pointing to the signed post metadata document on Arweave.",
  }),
  arweaveTxId: Schema.String.annotate({
    description: "Arweave transaction ID of the signed post metadata.",
  }),
  arweaveBlockHeight: Schema.NullOr(NonNegativeInt).annotate({
    description:
      "Arweave block height where the transaction was mined, or `null` while awaiting bundle confirmation.",
  }),
  createdAt: DateTime.pipe(
    Schema.annotateEncoded({
      description: "ISO 8601 timestamp when the post was published.",
    }),
  ),
  updatedAt: DateTime.pipe(
    Schema.annotateEncoded({
      description: "ISO 8601 timestamp when the post record was last updated.",
    }),
  ),
  author: PublicUser,
  opentimestamps: Schema.NullOr(PostOpenTimestamps).annotate({
    description:
      "Bitcoin OpenTimestamps proof metadata, or `null` until the post is submitted for timestamping.",
  }),
}).annotate({
  identifier: "Post",
  description:
    "A published post with full Markdown content, author profile, and on-chain proofs.",
});

export const PostListResponse = Schema.Struct({
  results: Schema.Array(PostListItem).annotate({
    description: "Published posts for the requested page, newest first.",
  }),
  limit: NonNegativeInt.annotate({
    description: "Maximum number of posts requested per page.",
  }),
  offset: NonNegativeInt.annotate({
    description: "Number of posts skipped from the start of the list.",
  }),
  total: NonNegativeInt.annotate({
    description: "Total number of matching published posts.",
  }),
}).annotate({
  identifier: "PostListResponse",
  description: "Paginated list of publicly visible published posts.",
});

export const PostListQuery = Schema.Struct({
  author: Schema.optionalKey(
    Schema.String.annotate({
      description:
        "Filter posts by author Stacks address. Matches posts published from any wallet linked to that user.",
    }),
  ),
  ...paginationQueryFields(POST_LIST_MAX_LIMIT),
}).annotate({ identifier: "PostListQuery" });

export const PostsGroup = HttpApiGroup.make("posts")
  .annotate(OpenApi.Title, "Posts")
  .annotate(
    OpenApi.Description,
    "Read publicly visible posts published on Sigle, including cover media metadata, author profiles, and OpenTimestamps proofs.",
  )
  .add(
    HttpApiEndpoint.get("list", "/", {
      query: PostListQuery,
      success: HttpApiSchema.WithHeaders(PostListResponse, PublicCacheHeaders),
      error: BadRequest,
    })
      .annotate(OpenApi.Summary, "List posts")
      .annotate(
        OpenApi.Description,
        "Returns publicly visible posts ordered newest first, omitting hidden posts. Pass `author` to restrict results to a single user (matching any linked Stacks wallet of that account). Publicly cacheable (`ETag`).",
      )
      .annotate(
        OpenApi.Transform,
        documentPaginationQuery({
          maxLimit: POST_LIST_MAX_LIMIT,
          defaultLimit: POST_LIST_DEFAULT_LIMIT,
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get("get", "/:postId", {
      params: {
        postId: Schema.String.annotate({
          description: "Post ID (its Arweave transaction ID).",
        }),
      },
      success: HttpApiSchema.WithHeaders(Post, PublicCacheHeaders),
      error: NotFound,
    })
      .annotate(OpenApi.Summary, "Get post")
      .annotate(
        OpenApi.Description,
        "Returns a published post with its full Markdown content, cover image placeholder, author profile, Arweave confirmation height, and OpenTimestamps proof status. Hidden posts return `404` for all callers, including the author. Publicly cacheable (`ETag`).",
      ),
  )
  .prefix("/api/posts")
  .middleware(RateLimitMiddleware);
