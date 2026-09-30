import { type ProfileMetadata, ProfileMetadataSchema } from "@sigle/sdk";
import { Effect, Schema, SchemaIssue } from "effect";
import {
  HttpApiEndpoint,
  HttpApiGroup,
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
  UnsupportedMediaType,
} from "@/api/schemas";
import { allowedImageFormats } from "@/lib/images";
import { profileImageKinds } from "@/lib/profile-images";

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

export const ProfileImageKindSchema = Schema.Literals(profileImageKinds);

export const UploadProfileImageResponse = Schema.Struct({
  url: Schema.String,
  key: Schema.String,
  width: Schema.Int,
  height: Schema.Int,
}).annotate({ identifier: "UploadProfileImageResponse" });

/**
 * The endpoints read the raw request body themselves (see the handlers), so the
 * binary request body is documented manually in the OpenAPI specification.
 */
const profileImageRequestBody = {
  required: true,
  content: Object.fromEntries(
    allowedImageFormats.map((contentType) => [
      contentType,
      { schema: { type: "string", format: "binary" } },
    ]),
  ),
};

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
      .annotate(OpenApi.Override, { requestBody: profileImageRequestBody })
      .annotate(RateLimitPolicy, "profileImageUpload"),
  )
  .prefix("/api/protected/user/profile")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
