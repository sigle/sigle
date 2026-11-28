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
  ServiceUnavailable,
  UnsupportedMediaType,
} from "@/api/schemas";
import { profileImageKinds, profileImageMaxMib } from "@/lib/profile-images";

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
const ProfileField = <S extends Schema.Top>(schema: S, description: string) =>
  Schema.optionalKey(Schema.NullOr(schema)).pipe(
    Schema.annotateEncoded({
      description: `${description} Omit or set to \`null\` to clear.`,
    }),
  );

export const UpdateProfilePayload = Schema.Struct({
  displayName: ProfileField(
    ProfileDisplayName,
    `Public display name (up to ${PROFILE_LIMITS.displayName} characters).`,
  ),
  description: ProfileField(
    ProfileDescription,
    `Markdown biography (up to ${PROFILE_LIMITS.description} characters).`,
  ),
  website: ProfileField(
    ProfileWebsite,
    `HTTP(S) website URL (up to ${PROFILE_LIMITS.website} characters).`,
  ),
  twitter: ProfileField(
    ProfileTwitter,
    "X (Twitter) handle without the leading `@` (1–15 word characters).",
  ),
}).annotate({
  identifier: "UpdateProfilePayload",
  description: "Full replacement payload for the profile's text fields.",
});

export const UpdateProfileResponse = Schema.Struct({
  address: Schema.String.annotate({
    description: "Primary Stacks address under which the profile is stored.",
  }),
  profile: UserProfile,
}).annotate({
  identifier: "UpdateProfileResponse",
  description:
    "Stored profile returned after updating fields or uploading an image.",
});

/**
 * Profile fields read from a BNS V2 zonefile. A field is null when the
 * zonefile doesn't set it or sets a value the profile can't store.
 */
export const BnsProfile = Schema.Struct({
  displayName: Schema.NullOr(Schema.String).annotate({
    description:
      "Display name extracted from the zonefile, or `null` if missing or invalid.",
  }),
  description: Schema.NullOr(Schema.String).annotate({
    description:
      "Bio extracted from the zonefile, or `null` if missing or invalid.",
  }),
  website: Schema.NullOr(Schema.String).annotate({
    description:
      "Website URL extracted from the zonefile, or `null` if missing or invalid.",
  }),
  twitter: Schema.NullOr(Schema.String).annotate({
    description:
      "X (Twitter) handle extracted from the zonefile without `@`, or `null` if missing or invalid.",
  }),
}).annotate({
  identifier: "BnsProfile",
  description: "Importable profile fields parsed from a BNS V2 JSON zonefile.",
});

export const BnsProfileResponse = Schema.Struct({
  name: Schema.NullOr(Schema.String).annotate({
    description:
      "Primary BNS V2 name of the user's primary Stacks address (for example, `satoshi.btc`), or `null` if none.",
  }),
  profile: Schema.NullOr(BnsProfile).annotate({
    description:
      "Importable profile fields from the zonefile, or `null` when no valid profile data is present.",
  }),
}).annotate({
  identifier: "BnsProfileResponse",
  description: "Primary BNS V2 name and importable profile preview.",
});

export const ProfileImageKindSchema = Schema.Literals(
  profileImageKinds,
).annotate({
  identifier: "ProfileImageKind",
  description: "Profile image slot to replace (`avatar` or `cover`).",
});

const AVATAR_MAX_MIB = profileImageMaxMib("avatar");
const COVER_MAX_MIB = profileImageMaxMib("cover");

export const ProfileGroup = HttpApiGroup.make("profile")
  .annotate(OpenApi.Title, "Profile")
  .annotate(
    OpenApi.Description,
    "Manage the authenticated user's public profile fields, avatar and cover images, and BNS V2 profile import.",
  )
  .add(
    HttpApiEndpoint.put("update", "/", {
      payload: UpdateProfilePayload,
      success: UpdateProfileResponse,
    })
      .annotate(OpenApi.Summary, "Update profile")
      .annotate(
        OpenApi.Description,
        "Replaces all text fields on the profile of the authenticated user's primary Stacks address and returns the stored profile. Any omitted or `null` field is cleared. Avatar and cover images are preserved and managed via `PUT /api/me/profile/images/{kind}`.",
      )
      .annotate(RateLimitPolicy, "profileUpdate"),
  )
  .add(
    HttpApiEndpoint.get("bns", "/bns", {
      success: BnsProfileResponse,
    })
      .annotate(OpenApi.Summary, "Preview BNS profile")
      .annotate(
        OpenApi.Description,
        "Looks up the primary BNS V2 name for the authenticated user's primary Stacks address and extracts importable fields from its JSON zonefile to prefill profile forms. Does not save any changes. Non-JSON zonefiles and zonefiles written for a previous owner are ignored. Returns `500` if the Stacks API is unreachable.",
      )
      .annotate(RateLimitPolicy, "bnsProfileImport"),
  )
  .add(
    HttpApiEndpoint.put("uploadImage", "/images/:kind", {
      params: {
        kind: ProfileImageKindSchema,
      },
      success: UpdateProfileResponse,
      error: [
        BadRequest,
        PayloadTooLarge,
        ServiceUnavailable,
        UnsupportedMediaType,
      ],
    })
      .annotate(OpenApi.Summary, "Upload profile image")
      .annotate(
        OpenApi.Description,
        `Uploads a raw binary JPEG, PNG, or WebP image (up to ${AVATAR_MAX_MIB} MiB for \`avatar\`, ${COVER_MAX_MIB} MiB for \`cover\`), re-encodes it as an optimized WebP image, updates the profile immediately, and returns the stored profile. Previously uploaded Sigle-hosted images in the same slot are deleted on a best-effort basis.`,
      )
      .annotate(OpenApi.Override, {
        requestBody: imageRequestBody(
          `Raw image binary in JPEG, PNG, or WebP format (max ${AVATAR_MAX_MIB} MiB for \`avatar\`, ${COVER_MAX_MIB} MiB for \`cover\`).`,
        ),
      })
      .annotate(RateLimitPolicy, "profileImageUpload"),
  )
  .prefix("/api/me/profile")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
