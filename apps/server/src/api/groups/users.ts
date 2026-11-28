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
  Uri,
} from "@/api/schemas";

export const MediaImage = Schema.Struct({
  url: Uri.annotate({
    description: "Public URL of the image.",
  }),
  width: Schema.NullOr(NonNegativeInt).annotate({
    description: "Image width in pixels, or `null` if unavailable.",
  }),
  height: Schema.NullOr(NonNegativeInt).annotate({
    description: "Image height in pixels, or `null` if unavailable.",
  }),
  thumbhash: Schema.NullOr(Schema.String).annotate({
    description:
      "Base64-encoded ThumbHash placeholder for progressive loading, or `null` if unavailable.",
  }),
}).annotate({
  identifier: "MediaImage",
  description:
    "Image URL paired with optional dimensions and ThumbHash placeholder metadata.",
});

export const UserProfile = Schema.Struct({
  displayName: Schema.NullOr(Schema.String).annotate({
    description: "Public display name, or `null` if unset.",
  }),
  description: Schema.NullOr(Schema.String).annotate({
    description: "Markdown biography, or `null` if unset.",
  }),
  website: Schema.NullOr(Uri).annotate({
    description: "HTTP(S) website URL, or `null` if unset.",
  }),
  twitter: Schema.NullOr(Schema.String).annotate({
    description:
      "X (Twitter) handle without the leading `@`, or `null` if unset.",
  }),
  picture: Schema.NullOr(MediaImage).annotate({
    description: "Profile avatar image metadata, or `null` if unset.",
  }),
  coverPicture: Schema.NullOr(MediaImage).annotate({
    description: "Profile cover banner image metadata, or `null` if unset.",
  }),
  updatedAt: DateTime.pipe(
    Schema.annotateEncoded({
      description: "ISO 8601 timestamp when the profile was last updated.",
    }),
  ),
}).annotate({
  identifier: "UserProfile",
  description: "Public profile details for a Stacks address.",
});

/**
 * A user as anyone can see them: their primary Stacks address and its
 * profile, if any. Also the author of a post.
 */
export const PublicUser = Schema.Struct({
  address: Schema.String.annotate({
    description: "Stacks address identifying the user.",
  }),
  profile: Schema.NullOr(UserProfile).annotate({
    description: "User's public profile, or `null` if not set.",
  }),
  isExplorer: Schema.Boolean.annotate({
    description:
      "Whether the user holds the Pro plan (unlocked by an Explorer Guild NFT) and displays the Explorer Guild badge.",
  }),
}).annotate({
  identifier: "PublicUser",
  description:
    "Publicly visible user representation returned for profiles and post authors.",
});

export const PublicUserWithHeaders = HttpApiSchema.WithHeaders(
  PublicUser,
  PublicCacheHeaders,
);

export const UsersGroup = HttpApiGroup.make("users")
  .annotate(OpenApi.Title, "Users")
  .annotate(
    OpenApi.Description,
    "Look up public author profiles and Explorer status by Stacks address.",
  )
  .add(
    HttpApiEndpoint.get("get", "/:address", {
      params: {
        address: Schema.String.annotate({
          description: "Stacks address of the user.",
        }),
      },
      success: PublicUserWithHeaders,
      error: [BadRequest, NotFound],
    })
      .annotate(OpenApi.Summary, "Get user")
      .annotate(
        OpenApi.Description,
        "Returns a user's public profile and Explorer status for a Stacks address. `profile` is `null` if the user has not set one. Returns `400` for an invalid Stacks address and `404` if not found.",
      ),
  )
  .prefix("/api/users")
  .middleware(RateLimitMiddleware);
