import type { Multipart } from "effect/unstable/http";
import { Effect, FileSystem } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import type { UploadProfileMetadataPayload } from "@/api/groups/profile";
import { SigleApi } from "@/api";
import { CurrentUser } from "@/api/middleware/auth-user";
import { BadRequest, InternalServerError } from "@/api/schemas";
import { AppConfig } from "@/config";
import { isAllowedImageFormat, optimizeImage } from "@/lib/images";
import {
  profileImageKey,
  profileImagePostHogEvent,
  profileImageSettings,
  type ProfileImageKind,
  versionProfileImageUrl,
} from "@/lib/profile-images";
import { ArweaveService } from "@/services/arweave";
import { PostHogService } from "@/services/posthog";
import { StorageService } from "@/services/storage";

export const uploadProfileMetadata = (
  payload: typeof UploadProfileMetadataPayload.Type,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const arweave = yield* ArweaveService;
    const posthog = yield* PostHogService;

    const file = Buffer.from(JSON.stringify(payload.metadata));

    const result = yield* arweave
      .uploadFile({
        file,
        contentType: "application/json",
      })
      .pipe(
        Effect.mapError(
          (error) =>
            new InternalServerError({
              message: `Failed to upload to Arweave, error: ${error.message}`,
            }),
        ),
      );

    yield* posthog.capture({
      distinctId: user.id,
      event: "profile metadata uploaded",
      properties: {
        arweaveId: result.id,
      },
    });

    return result;
  });

export const uploadProfileImage = (
  file: Multipart.PersistedFile,
  kind: ProfileImageKind,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const config = yield* AppConfig;
    const fs = yield* FileSystem.FileSystem;
    const storage = yield* StorageService;
    const posthog = yield* PostHogService;

    if (!isAllowedImageFormat(file.contentType)) {
      return yield* new BadRequest({
        message: `Unsupported image format: ${file.contentType}`,
      });
    }

    const buffer = yield* fs.readFile(file.path).pipe(Effect.orDie);
    const { quality, width } = profileImageSettings(config.STACKS_ENV, kind);

    const optimized = yield* optimizeImage({ buffer, quality, width }).pipe(
      Effect.tapError((error) =>
        Effect.logWarning("Failed to optimize profile image", {
          cause: error.cause,
          contentType: file.contentType,
          kind,
        }),
      ),
      Effect.mapError(
        () => new BadRequest({ message: "Failed to optimize image." }),
      ),
    );

    const key = profileImageKey(user.id, kind);

    const uploaded = yield* storage
      .uploadFile({ body: optimized, contentType: "image/webp", key })
      .pipe(
        Effect.mapError(
          (error) =>
            new InternalServerError({
              message: `Failed to upload image, error: ${error.message}`,
            }),
        ),
      );

    const url = versionProfileImageUrl(uploaded.url);

    yield* posthog.capture({
      distinctId: user.id,
      event: profileImagePostHogEvent(kind),
      properties: {
        key,
        sizeBytes: optimized.length,
        url,
      },
    });

    return { url };
  });

export const ProfileHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "profile",
  (handlers) =>
    handlers
      .handle("uploadMetadata", ({ payload }) => uploadProfileMetadata(payload))
      .handle("uploadAvatar", ({ payload }) =>
        uploadProfileImage(payload.file, "avatar"),
      )
      .handle("uploadCover", ({ payload }) =>
        uploadProfileImage(payload.file, "cover"),
      ),
);
