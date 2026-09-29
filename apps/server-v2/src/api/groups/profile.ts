import { type ProfileMetadata, ProfileMetadataSchema } from "@sigle/sdk";
import { Effect, Schema, SchemaIssue } from "effect";
import { Multipart } from "effect/unstable/http";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "effect/unstable/httpapi";
import { UserAuthMiddleware } from "@/api/middleware/auth-user";
import {
  RateLimitMiddleware,
  RateLimitPolicy,
} from "@/api/middleware/rate-limit";
import {
  BadRequest,
  InternalServerError,
  PayloadTooLarge,
} from "@/api/schemas";
import { PROFILE_IMAGE_MAX_SIZE } from "@/lib/profile-images";

/**
 * Profile metadata is a shared wire format defined in `@sigle/sdk` (and
 * published as a JSON schema), so the zod schema is reused as the single
 * source of truth instead of being mirrored in Effect.
 */
export const ProfileMetadataValue =
  Schema.declareConstructor<ProfileMetadata>()(
    [],
    () => (input, self, options) => {
      const parsed = ProfileMetadataSchema.safeParse(input);

      return parsed.success
        ? Effect.succeed(parsed.data)
        : Effect.fail(new SchemaIssue.InvalidType(self, input, options));
    },
    {
      identifier: "ProfileMetadata",
      description: "The profile metadata to upload to Arweave.",
    },
  );

export const UploadProfileMetadataPayload = Schema.Struct({
  metadata: ProfileMetadataValue,
});

export const UploadProfileMetadataResponse = Schema.Struct({
  id: Schema.String,
  uri: Schema.String,
  cid: Schema.String,
  gatewayUrl: Schema.String,
}).annotate({ identifier: "UploadProfileMetadataResponse" });

export const UploadProfileImagePayload = Schema.Struct({
  file: Multipart.SingleFileSchema,
}).pipe(
  HttpApiSchema.asMultipart({
    maxFileSize: PROFILE_IMAGE_MAX_SIZE,
    maxTotalSize: PROFILE_IMAGE_MAX_SIZE,
  }),
);

export const UploadProfileImageResponse = Schema.Struct({
  url: Schema.String,
}).annotate({ identifier: "UploadProfileImageResponse" });

export const ProfileGroup = HttpApiGroup.make("profile")
  .add(
    HttpApiEndpoint.post("uploadMetadata", "/upload-metadata", {
      payload: UploadProfileMetadataPayload,
      success: UploadProfileMetadataResponse,
      error: InternalServerError,
    })
      .annotate(OpenApi.Summary, "Upload profile metadata")
      .annotate(
        OpenApi.Description,
        "Upload the profile metadata to Arweave and return the transaction id.",
      )
      .annotate(RateLimitPolicy, "profileMetadataUpload"),
  )
  .add(
    HttpApiEndpoint.post("uploadAvatar", "/upload-avatar", {
      payload: UploadProfileImagePayload,
      success: UploadProfileImageResponse,
      error: [BadRequest, PayloadTooLarge, InternalServerError],
    })
      .annotate(OpenApi.Summary, "Upload profile avatar")
      .annotate(
        OpenApi.Description,
        "Upload the profile avatar image. Re-uploading replaces the previous avatar.",
      )
      .annotate(RateLimitPolicy, "profileImageUpload"),
  )
  .add(
    HttpApiEndpoint.post("uploadCover", "/upload-cover", {
      payload: UploadProfileImagePayload,
      success: UploadProfileImageResponse,
      error: [BadRequest, PayloadTooLarge, InternalServerError],
    })
      .annotate(OpenApi.Summary, "Upload profile cover")
      .annotate(
        OpenApi.Description,
        "Upload the profile cover image. Re-uploading replaces the previous cover.",
      )
      .annotate(RateLimitPolicy, "profileImageUpload"),
  )
  .prefix("/api/protected/user/profile")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
