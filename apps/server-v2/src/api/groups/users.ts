import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";
import { RateLimitMiddleware } from "@/api/middleware/rate-limit";
import { NotFound } from "@/api/schemas";

const DateTime = Schema.DateTimeUtcFromString.pipe(
  Schema.annotateEncoded({ format: "date-time" }),
);

export const UserProfile = Schema.Struct({
  displayName: Schema.NullOr(Schema.String),
  description: Schema.NullOr(Schema.String),
  website: Schema.NullOr(Schema.String),
  twitter: Schema.NullOr(Schema.String),
  picture: Schema.NullOr(Schema.String),
  coverPicture: Schema.NullOr(Schema.String),
  arweaveTxId: Schema.String,
  updatedAt: DateTime,
}).annotate({ identifier: "UserProfile" });

export const UserProfileResponse = Schema.Struct({
  address: Schema.String,
  profile: Schema.NullOr(UserProfile),
  postsCount: Schema.Int,
}).annotate({ identifier: "UserProfileResponse" });

export const UsersGroup = HttpApiGroup.make("users")
  .add(
    HttpApiEndpoint.get("get", "/:username", {
      params: {
        username: Schema.String,
      },
      success: UserProfileResponse,
      error: NotFound,
    })
      .annotate(OpenApi.Summary, "Get a user profile")
      .annotate(
        OpenApi.Description,
        "Get a public user by Stacks address with their profile and published post count.",
      ),
  )
  .prefix("/api/users")
  .middleware(RateLimitMiddleware);
