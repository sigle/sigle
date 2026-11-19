import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";
import { MediaImage, UserProfileResponse } from "@/api/groups/users";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";
import {
  BadRequest,
  documentPaginationQuery,
  NotFound,
  paginationQueryFields,
} from "@/api/schemas";
import { postOtsStatusEnum } from "@/db/schema";

export const POST_LIST_DEFAULT_LIMIT = 20;

export const POST_LIST_MAX_LIMIT = 100;

const DateTime = Schema.DateTimeUtcFromString.pipe(
  Schema.annotateEncoded({ format: "date-time" }),
);

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
  // Null when that user has no linked wallet.
  author: Schema.NullOr(UserProfileResponse),
}).annotate({ identifier: "PostListItem" });

export const PostOpenTimestamps = Schema.Struct({
  status: Schema.Literals(postOtsStatusEnum.enumValues),
  // Arweave transaction id of the Bitcoin-anchored `.ots` proof, once
  // upgraded.
  otsTxId: Schema.NullOr(Schema.String),
  bitcoinBlockHeight: Schema.NullOr(Schema.Int),
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
  arweaveBlockHeight: Schema.NullOr(Schema.Int),
  createdAt: DateTime,
  updatedAt: DateTime,
  // Primary wallet of the user who published the post, with their profile.
  // Null when that user has no linked wallet.
  author: Schema.NullOr(UserProfileResponse),
  // Null until the post metadata is submitted to OpenTimestamps.
  opentimestamps: Schema.NullOr(PostOpenTimestamps),
}).annotate({ identifier: "Post" });

export const PostListResponse = Schema.Struct({
  results: Schema.Array(PostListItem),
  limit: Schema.Int,
  offset: Schema.Int,
  total: Schema.Int,
}).annotate({ identifier: "PostListResponse" });

export const PostListQuery = Schema.Struct({
  // Stacks address of the author.
  username: Schema.optionalKey(Schema.String),
  ...paginationQueryFields(POST_LIST_MAX_LIMIT),
}).annotate({ identifier: "PostListQuery" });

export const PostsGroup = HttpApiGroup.make("posts")
  .add(
    HttpApiEndpoint.get("list", "/", {
      query: PostListQuery,
      success: PostListResponse,
      error: BadRequest,
    })
      .annotate(OpenApi.Summary, "List posts")
      .annotate(
        OpenApi.Description,
        "List published posts, newest first. Pass `username` (a Stacks address) to only list the posts of that author.",
      )
      .annotate(
        OpenApi.Transform,
        documentPaginationQuery(POST_LIST_MAX_LIMIT),
      ),
  )
  .add(
    HttpApiEndpoint.get("get", "/:postId", {
      params: {
        postId: Schema.String,
      },
      success: Post,
      error: NotFound,
    })
      .annotate(OpenApi.Summary, "Get a post")
      .annotate(
        OpenApi.Description,
        "Get a published post with its cover image placeholder, its author profile, and its OpenTimestamps proof status.",
      ),
  )
  .prefix("/api/posts")
  .middleware(RateLimitMiddleware);
