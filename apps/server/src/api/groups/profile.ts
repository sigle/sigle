import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";
import { UserProfile } from "@/api/groups/users";
import { UserAuthMiddleware } from "@/api/middleware/auth-user";
import {
  RateLimitMiddleware,
  RateLimitPolicy,
} from "@/api/middleware/rate-limit";
import {
  BadRequest,
  imageRequestBody,
  isUrlWithProtocol,
  PayloadTooLarge,
  UnsupportedMediaType,
} from "@/api/schemas";
import { profileImageKinds } from "@/lib/profile-images";

/** Profile field limits, in characters. */
export const PROFILE_LIMITS = {
  displayName: 100,
  description: 2000,
  website: 200,
} as const;

export const ProfileDisplayName = Schema.String.check(
  Schema.isMinLength(1),
  Schema.isMaxLength(PROFILE_LIMITS.displayName),
);

// Markdown.
export const ProfileDescription = Schema.String.check(
  Schema.isMinLength(1),
  Schema.isMaxLength(PROFILE_LIMITS.description),
);

export const ProfileWebsite = Schema.String.annotate({ format: "uri" }).check(
  Schema.isMaxLength(PROFILE_LIMITS.website),
  isUrlWithProtocol(["http:", "https:"], "an http(s) URL"),
);

// An X username, without the `@`.
export const ProfileTwitter = Schema.String.check(
  Schema.isPattern(/^\w{1,15}$/),
);

/** Omit a field, or set it to null, to clear it. */
const ProfileField = <S extends Schema.Top>(schema: S) =>
  Schema.optionalKey(Schema.NullOr(schema));

export const UpdateProfilePayload = Schema.Struct({
  displayName: ProfileField(ProfileDisplayName),
  description: ProfileField(ProfileDescription),
  website: ProfileField(ProfileWebsite),
  twitter: ProfileField(ProfileTwitter),
}).annotate({ identifier: "UpdateProfilePayload" });

export const UpdateProfileResponse = Schema.Struct({
  // The primary address of the user, the profile is stored under it.
  address: Schema.String,
  // The stored profile, so clients don't need to fetch it again.
  profile: UserProfile,
}).annotate({ identifier: "UpdateProfileResponse" });

/**
 * Profile fields read from a BNS V2 zonefile. A field is null when the
 * zonefile doesn't set it or sets a value the profile can't store.
 */
export const BnsProfile = Schema.Struct({
  displayName: Schema.NullOr(Schema.String),
  description: Schema.NullOr(Schema.String),
  website: Schema.NullOr(Schema.String),
  twitter: Schema.NullOr(Schema.String),
}).annotate({ identifier: "BnsProfile" });

export const BnsProfileResponse = Schema.Struct({
  // Primary BNS name of the user's address, such as `satoshi.btc`.
  name: Schema.NullOr(Schema.String),
  // Null without a name, or when its zonefile has no profile to import.
  profile: Schema.NullOr(BnsProfile),
}).annotate({ identifier: "BnsProfileResponse" });

export const ProfileImageKindSchema = Schema.Literals(
  profileImageKinds,
).annotate({ identifier: "ProfileImageKind" });

export const ProfileGroup = HttpApiGroup.make("profile")
  .annotate(
    OpenApi.Description,
    "The signed-in user's profile: its fields, the avatar and cover images, and an import from their BNS name.",
  )
  .add(
    HttpApiEndpoint.put("update", "/", {
      payload: UpdateProfilePayload,
      success: UpdateProfileResponse,
    })
      .annotate(OpenApi.Summary, "Update the profile")
      .annotate(
        OpenApi.Description,
        "Replace the text fields of the profile of the user's primary address, and return the stored profile. A field that is omitted or null is cleared. The avatar and cover are set by uploading them.",
      )
      .annotate(RateLimitPolicy, "profileUpdate"),
  )
  .add(
    HttpApiEndpoint.get("bns", "/bns", {
      success: BnsProfileResponse,
    })
      .annotate(OpenApi.Summary, "Read the profile of the user's BNS name")
      .annotate(
        OpenApi.Description,
        "Read the primary BNS V2 name of the user's primary address and the profile fields of its zonefile, to fill in the profile form. Nothing is saved. Only JSON zonefiles are read, and a zonefile written for another owner of the name is ignored. Returns a 500 when the Stacks API cannot be reached.",
      )
      .annotate(RateLimitPolicy, "bnsProfileImport"),
  )
  .add(
    HttpApiEndpoint.put("uploadImage", "/images/:kind", {
      params: { kind: ProfileImageKindSchema },
      success: UpdateProfileResponse,
      error: [BadRequest, PayloadTooLarge, UnsupportedMediaType],
    })
      .annotate(OpenApi.Summary, "Upload a profile image")
      .annotate(
        OpenApi.Description,
        "Upload a profile avatar or cover image as a raw binary body, set it on the profile of the user's primary address right away, and return the stored profile. The image it replaces is deleted.",
      )
      .annotate(OpenApi.Override, { requestBody: imageRequestBody })
      .annotate(RateLimitPolicy, "profileImageUpload"),
  )
  .prefix("/api/me/profile")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
