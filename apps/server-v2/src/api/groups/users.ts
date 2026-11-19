import { Schema } from "effect";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "effect/http-api";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";
import { BadRequest, NotFound } from "@/api/schemas";

const DateTime = Schema.DateTimeUtcFromString.pipe(
  Schema.annotateEncoded({ format: "date-time" }),
);

export const MediaImage = Schema.Struct({
  url: Schema.String,
  width: Schema.NullOr(Schema.Int),
  height: Schema.NullOr(Schema.Int),
  thumbhash: Schema.NullOr(Schema.String),
}).annotate({ identifier: "MediaImage" });

export const UserProfile = Schema.Struct({
  displayName: Schema.NullOr(Schema.String),
  description: Schema.NullOr(Schema.String),
  website: Schema.NullOr(Schema.String),
  twitter: Schema.NullOr(Schema.String),
  picture: Schema.NullOr(MediaImage),
  coverPicture: Schema.NullOr(MediaImage),
  arweaveTxId: Schema.String,
  updatedAt: DateTime,
}).annotate({ identifier: "UserProfile" });

export const UserProfileResponse = Schema.Struct({
  address: Schema.String,
  profile: Schema.NullOr(UserProfile),
}).annotate({ identifier: "UserProfileResponse" });

export const UserProfileResponseWithHeaders = HttpApiSchema.WithHeaders(
  UserProfileResponse,
  {
    "cache-control": Schema.String,
    etag: Schema.String,
  },
);

export const UsersGroup = HttpApiGroup.make("users")
  .add(
    HttpApiEndpoint.get("get", "/:username", {
      params: {
        username: Schema.String,
      },
      success: UserProfileResponseWithHeaders,
      error: [BadRequest, NotFound],
    })
      .annotate(OpenApi.Summary, "Get a user profile")
      .annotate(
        OpenApi.Description,
        "Get a public user by Stacks address with their profile. Responses are cacheable via `Cache-Control` and `ETag`.",
      ),
  )
  .prefix("/api/users")
  .middleware(RateLimitMiddleware);
