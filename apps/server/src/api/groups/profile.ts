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
  Conflict,
  imageRequestBody,
  PayloadTooLarge,
  TooManyRequests,
  UnsupportedMediaType,
  UploadedImageResponse,
} from "@/api/schemas";
import { ProfileMetadata } from "@/lib/metadata";
import { profileImageKinds } from "@/lib/profile-images";
import { PROFILE_UPDATE_LIMIT } from "@/services/plan";

/**
 * Largest signed profile metadata uploaded to Arweave, as JSON. The server's
 * Arweave key pays for each upload, and the metadata schema doesn't limit the
 * description or attributes.
 */
export const PROFILE_METADATA_MAX_KIB = 32;

export const UpdateProfilePayload = Schema.Struct({
  metadata: ProfileMetadata,
}).annotate({ identifier: "UpdateProfilePayload" });

export const UpdateProfileResponse = Schema.Struct({
  arweaveTxId: Schema.String,
  uri: Schema.String,
  cid: Schema.String,
  gatewayUrl: Schema.String,
  // The signing address the profile is stored under.
  address: Schema.String,
  // The stored profile, so clients don't need to fetch it again.
  profile: UserProfile,
}).annotate({ identifier: "UpdateProfileResponse" });

export const ProfileImageKindSchema = Schema.Literals(
  profileImageKinds,
).annotate({ identifier: "ProfileImageKind" });

export const ProfileGroup = HttpApiGroup.make("profile")
  .annotate(
    OpenApi.Description,
    "The signed-in user's profile: upload signed profile metadata to Arweave and the avatar and cover images.",
  )
  .add(
    HttpApiEndpoint.put("update", "/", {
      payload: UpdateProfilePayload,
      success: UpdateProfileResponse,
      // The 429 is also returned once the daily profile update limit is
      // reached.
      error: [BadRequest, Conflict, PayloadTooLarge, TooManyRequests],
    })
      .annotate(OpenApi.Summary, "Update the profile")
      .annotate(
        OpenApi.Description,
        `Update the profile with signed profile metadata: upload it to Arweave, store it as the profile of the signing address, and return the transaction and the stored profile. Returns a 413 when the metadata is over ${PROFILE_METADATA_MAX_KIB} KiB as JSON, and a 429 once the user has updated their profile ${PROFILE_UPDATE_LIMIT} times in the last 24 hours.`,
      )
      .annotate(RateLimitPolicy, "profileMetadataUpload"),
  )
  .add(
    HttpApiEndpoint.put("uploadImage", "/images/:kind", {
      params: { kind: ProfileImageKindSchema },
      success: UploadedImageResponse,
      error: [BadRequest, PayloadTooLarge, UnsupportedMediaType],
    })
      .annotate(OpenApi.Summary, "Upload a profile image")
      .annotate(
        OpenApi.Description,
        "Upload a profile avatar or cover image as a raw binary body. Re-uploading the same image is a no-op, uploading a different image replaces the previous file.",
      )
      .annotate(OpenApi.Override, { requestBody: imageRequestBody })
      .annotate(RateLimitPolicy, "profileImageUpload"),
  )
  .prefix("/api/me/profile")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
