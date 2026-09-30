import { ByteSize, Effect } from "effect";
import { HttpServerRequest } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import type { UploadProfileMetadataPayload } from "@/api/groups/profile";
import { SigleApi } from "@/api";
import { CurrentUser } from "@/api/middleware/auth-user";
import {
  BadRequest,
  InternalServerError,
  PayloadTooLarge,
  UnsupportedMediaType,
} from "@/api/schemas";
import { AppConfig } from "@/config";
import { sha256Hex } from "@/lib/hash";
import { isAllowedImageFormat, optimizeImage } from "@/lib/images";
import {
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_MAX_MIB,
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

const normalizeContentType = (contentType: string): string =>
  contentType.split(";")[0]?.trim().toLowerCase() ?? "";

const readImageBody = (request: HttpServerRequest.HttpServerRequest) =>
  request.arrayBuffer.pipe(
    Effect.provideService(
      HttpServerRequest.MaxBodySize,
      ByteSize.mebibytes(PROFILE_IMAGE_MAX_MIB),
    ),
    Effect.map((buffer) => new Uint8Array(buffer)),
    Effect.tapError((error) =>
      Effect.logWarning("Failed to read profile image body", { cause: error }),
    ),
    Effect.mapError(
      () =>
        new PayloadTooLarge({
          message: `Image is too large, maximum size is ${PROFILE_IMAGE_MAX_MIB} MiB.`,
        }),
    ),
  );

export const uploadProfileImage = (
  kind: ProfileImageKind,
  request: HttpServerRequest.HttpServerRequest,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const config = yield* AppConfig;
    const storage = yield* StorageService;
    const posthog = yield* PostHogService;

    const contentType = normalizeContentType(
      request.headers["content-type"] ?? "",
    );

    if (!isAllowedImageFormat(contentType)) {
      return yield* new UnsupportedMediaType({
        message: `Unsupported image format: ${contentType}`,
      });
    }

    const declaredSize = Number(request.headers["content-length"] ?? "");

    if (
      Number.isFinite(declaredSize) &&
      declaredSize > PROFILE_IMAGE_MAX_BYTES
    ) {
      return yield* new PayloadTooLarge({
        message: `Image is too large, maximum size is ${PROFILE_IMAGE_MAX_MIB} MiB.`,
      });
    }

    const buffer = yield* readImageBody(request);

    if (buffer.length === 0) {
      return yield* new BadRequest({ message: "No image provided" });
    }

    const { quality, width } = profileImageSettings(config.STACKS_ENV, kind);

    const optimized = yield* optimizeImage({ buffer, quality, width }).pipe(
      Effect.tapError((error) =>
        Effect.logWarning("Failed to optimize profile image", {
          cause: error.cause,
          contentType,
          kind,
        }),
      ),
      Effect.mapError(
        () => new BadRequest({ message: "Failed to optimize image." }),
      ),
    );

    const version = sha256Hex(optimized.buffer);
    const key = profileImageKey(user.id, kind);

    const uploaded = yield* storage
      .uploadFile({
        body: optimized.buffer,
        contentType: "image/webp",
        key,
        version,
      })
      .pipe(
        Effect.mapError(
          (error) =>
            new InternalServerError({
              message: `Failed to upload image, error: ${error.message}`,
            }),
        ),
      );

    const url = versionProfileImageUrl(uploaded.url, version);

    yield* posthog.capture({
      distinctId: user.id,
      event: profileImagePostHogEvent(kind),
      properties: {
        key,
        sizeBytes: optimized.buffer.length,
        url,
      },
    });

    return {
      height: optimized.height,
      key,
      url,
      width: optimized.width,
    };
  });

export const ProfileHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "profile",
  (handlers) =>
    handlers
      .handle("uploadMetadata", ({ payload }) => uploadProfileMetadata(payload))
      .handle("uploadImage", ({ params, request }) =>
        uploadProfileImage(params.kind, request),
      ),
);
