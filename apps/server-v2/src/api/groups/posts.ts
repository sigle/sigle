import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";
import {
  BadRequest,
  documentPaginationQuery,
  paginationQueryFields,
} from "@/api/schemas";

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
  coverImage: Schema.NullOr(Schema.String),
  tags: Schema.Array(Schema.String),
  canonicalUri: Schema.NullOr(Schema.String),
  arweaveTxId: Schema.String,
  createdAt: DateTime,
  updatedAt: DateTime,
}).annotate({ identifier: "PostListItem" });

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
  .prefix("/api/posts")
  .middleware(RateLimitMiddleware);
