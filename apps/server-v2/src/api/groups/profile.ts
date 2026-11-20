import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";
import {
  UserAuthMiddleware,
  WhitelistedUserMiddleware,
} from "@/api/middleware/auth-user";
import {
  RateLimitMiddleware,
  RateLimitPolicy,
} from "@/api/middleware/rate-limit";
import {
  BadRequest,
  imageRequestBody,
  InternalServerError,
  PayloadTooLarge,
  UnsupportedMediaType,
} from "@/api/schemas";
import { ProfileMetadata } from "@/lib/metadata";
import { profileImageKinds } from "@/lib/profile-images";

export const UploadProfileMetadataPayload = Schema.Struct({
  metadata: ProfileMetadata,
});

export const UploadProfileMetadataResponse = Schema.Struct({
  id: Schema.String,
  uri: Schema.String,
  cid: Schema.String,
  gatewayUrl: Schema.String,
}).annotate({ identifier: "UploadProfileMetadataResponse" });

export const ProfileImageKindSchema = Schema.Literals(profileImageKinds);

export const UploadProfileImageResponse = Schema.Struct({
  url: Schema.String,
  key: Schema.String,
  width: Schema.Int,
  height: Schema.Int,
  // Base64 ThumbHash placeholder for the optimized image.
  thumbhash: Schema.String,
}).annotate({ identifier: "UploadProfileImageResponse" });

export const ProfileGroup = HttpApiGroup.make("profile")
  .annotate(
    OpenApi.Description,
    "The signed-in user's profile: upload signed profile metadata to Arweave and the avatar and cover images.",
  )
  .add(
    HttpApiEndpoint.post("uploadMetadata", "/upload-metadata", {
      payload: UploadProfileMetadataPayload,
      success: UploadProfileMetadataResponse,
      error: [BadRequest, InternalServerError],
    })
      .annotate(OpenApi.Summary, "Upload profile metadata")
      .annotate(
        OpenApi.Description,
        "Upload the profile metadata to Arweave and return the transaction id.",
      )
      .annotate(RateLimitPolicy, "profileMetadataUpload"),
  )
  .add(
    HttpApiEndpoint.put("uploadImage", "/images/:kind", {
      params: { kind: ProfileImageKindSchema },
      success: UploadProfileImageResponse,
      error: [
        BadRequest,
        PayloadTooLarge,
        UnsupportedMediaType,
        InternalServerError,
      ],
    })
      .annotate(OpenApi.Summary, "Upload a profile image")
      .annotate(
        OpenApi.Description,
        "Upload a profile avatar or cover image as a raw binary body. Re-uploading the same image is a no-op, uploading a different image replaces the previous file.",
      )
      .annotate(OpenApi.Override, { requestBody: imageRequestBody })
      .annotate(RateLimitPolicy, "profileImageUpload"),
  )
  .prefix("/api/protected/user/profile")
  .middleware(RateLimitMiddleware)
  .middleware(WhitelistedUserMiddleware)
  .middleware(UserAuthMiddleware);
