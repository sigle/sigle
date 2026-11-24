import { Schema } from "effect";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "effect/http-api";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";
import {
  BadRequest,
  DateTime,
  NonNegativeInt,
  NotFound,
  PublicCacheHeaders,
} from "@/api/schemas";

export const MediaImage = Schema.Struct({
  url: Schema.String,
  width: Schema.NullOr(NonNegativeInt),
  height: Schema.NullOr(NonNegativeInt),
  thumbhash: Schema.NullOr(Schema.String),
}).annotate({ identifier: "MediaImage" });

export const UserProfile = Schema.Struct({
  displayName: Schema.NullOr(Schema.String),
  description: Schema.NullOr(Schema.String),
  website: Schema.NullOr(Schema.String),
  twitter: Schema.NullOr(Schema.String),
  picture: Schema.NullOr(MediaImage),
  coverPicture: Schema.NullOr(MediaImage),
  updatedAt: DateTime,
}).annotate({ identifier: "UserProfile" });

/**
 * A user as anyone can see them: their primary Stacks address and its
 * profile, if any. Also the author of a post.
 */
export const PublicUser = Schema.Struct({
  address: Schema.String,
  profile: Schema.NullOr(UserProfile),
  isExplorer: Schema.Boolean.annotate({
    description:
      "Whether the user is on Pro, unlocked by holding an Explorer Guild NFT, and gets the Explorer Guild badge.",
  }),
}).annotate({ identifier: "PublicUser" });

export const PublicUserWithHeaders = HttpApiSchema.WithHeaders(
  PublicUser,
  PublicCacheHeaders,
);

export const UsersGroup = HttpApiGroup.make("users")
  .annotate(OpenApi.Description, "Public user profiles, by Stacks address.")
  .add(
    HttpApiEndpoint.get("get", "/:address", {
      params: {
        address: Schema.String,
      },
      success: PublicUserWithHeaders,
      error: [BadRequest, NotFound],
    })
      .annotate(OpenApi.Summary, "Get a user profile")
      .annotate(
        OpenApi.Description,
        "Get a public user by Stacks address with their profile. Responses are cacheable for a minute and carry an `ETag`, send it back in `If-None-Match` to get a 304 while the user is unchanged.",
      ),
  )
  .prefix("/api/users")
  .middleware(RateLimitMiddleware);
