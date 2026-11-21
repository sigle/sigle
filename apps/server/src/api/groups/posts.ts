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
  id: Schema.String,
  title: Schema.String,
  excerpt: Schema.String,
  metaTitle: Schema.NullOr(Schema.String),
  metaDescription: Schema.NullOr(Schema.String),
  coverImage: Schema.NullOr(MediaImage),
  tags: Schema.Array(Schema.String),
  canonicalUri: Schema.NullOr(Schema.String),
  arweaveTxId: Schema.String,
  createdAt: DateTime,
  updatedAt: DateTime,
  // Primary wallet of the user who published the post, with their profile.
  author: PublicUser,
}).annotate({ identifier: "PostListItem" });

export const PostOpenTimestamps = Schema.Struct({
  status: Schema.Literals(["pending", "upgraded", "failed"]).transform(
    postOtsStatuses,
  ),
  // Hex SHA-256 of the post metadata stored on Arweave, the file the proof
  // anchors.
  contentHash: Schema.String,
  // Arweave transaction id of the Bitcoin-anchored `.ots` proof, once
  // upgraded.
  otsTxId: Schema.NullOr(Schema.String),
  bitcoinBlockHeight: Schema.NullOr(NonNegativeInt),
  bitcoinBlockHash: Schema.NullOr(Schema.String),
  bitcoinTimestamp: Schema.NullOr(DateTime),
}).annotate({ identifier: "PostOpenTimestamps" });

export const Post = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  content: Schema.String,
  excerpt: Schema.String,
  metaTitle: Schema.NullOr(Schema.String),
  metaDescription: Schema.NullOr(Schema.String),
  coverImage: Schema.NullOr(MediaImage),
  tags: Schema.Array(Schema.String),
  canonicalUri: Schema.NullOr(Schema.String),
  metadataUri: Schema.String,
  arweaveTxId: Schema.String,
  // Null until the Arweave bundle is included in a block.
  arweaveBlockHeight: Schema.NullOr(NonNegativeInt),
  createdAt: DateTime,
  updatedAt: DateTime,
  // Primary wallet of the user who published the post, with their profile.
  author: PublicUser,
  // Null until the post metadata is submitted to OpenTimestamps.
  opentimestamps: Schema.NullOr(PostOpenTimestamps),
}).annotate({ identifier: "Post" });

export const PostListResponse = Schema.Struct({
  results: Schema.Array(PostListItem),
  limit: NonNegativeInt,
  offset: NonNegativeInt,
  total: NonNegativeInt,
}).annotate({ identifier: "PostListResponse" });

export const PostListQuery = Schema.Struct({
  // Stacks address of the author.
  author: Schema.optionalKey(Schema.String),
  ...paginationQueryFields(POST_LIST_MAX_LIMIT),
}).annotate({ identifier: "PostListQuery" });

export const PostsGroup = HttpApiGroup.make("posts")
  .annotate(
    OpenApi.Description,
    "Published posts, newest first, optionally filtered by author.",
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
        "List published posts, newest first. Pass `author` (a Stacks address) to only list the posts of that author. Responses are cacheable for a minute and carry an `ETag` for `If-None-Match`.",
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
        postId: Schema.String,
      },
      success: HttpApiSchema.WithHeaders(Post, PublicCacheHeaders),
      error: NotFound,
    })
      .annotate(OpenApi.Summary, "Get a post")
      .annotate(
        OpenApi.Description,
        "Get a published post with its cover image placeholder, its author profile, and its OpenTimestamps proof status. Responses are cacheable for a minute and carry an `ETag` for `If-None-Match`.",
      ),
  )
  .prefix("/api/posts")
  .middleware(RateLimitMiddleware);
