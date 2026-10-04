import {
  ArweaveTags,
  ArweaveTransactionTypes,
  verifyPostSignature,
} from "@sigle/sdk";
import { ByteSize, Effect, Option, Predicate } from "effect";
import { HttpServerError, HttpServerRequest } from "effect/http";
import { HttpApiBuilder } from "effect/http-api";
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
import {
  detectImageFormat,
  isAllowedImageFormat,
  mimeTypeForSharpFormat,
} from "@/lib/images";
import {
  profileImageKey,
  profileImageMaxBytes,
  profileImageMaxMib,
  profileImagePostHogEvent,
  profileImageSettings,
  type ProfileImageKind,
  versionProfileImageUrl,
} from "@/lib/profile-images";
import { ArweaveService } from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import { PostHogService } from "@/services/posthog";
import { StorageService } from "@/services/storage";
import { UserWhitelistService } from "@/services/users";

export const uploadProfileMetadata = (
  payload: typeof UploadProfileMetadataPayload.Type,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const config = yield* AppConfig;
    const arweave = yield* ArweaveService;
    const posthog = yield* PostHogService;
    const whitelist = yield* UserWhitelistService;

    // Verify that the signature is valid and belongs to a wallet owned by the logged-in user
    const signatureResult = verifyPostSignature(payload.metadata, {
      network: config.STACKS_ENV === "mainnet" ? "mainnet" : "testnet",
    });

    if (signatureResult.isErr()) {
      return yield* new BadRequest({
        message: signatureResult.error.error,
      });
    }

    const { recoveredAddress } = signatureResult.value;

    const ownsWallet = yield* whitelist.hasWalletAddress(
      user.id,
      recoveredAddress,
    );

    if (!ownsWallet) {
      return yield* new BadRequest({
        message:
          "Invalid signature: Signature verification failed or address mismatch",
      });
    }

    const file = Buffer.from(JSON.stringify(payload.metadata));

    const result = yield* arweave
      .uploadFile({
        file,
        contentType: "application/json",
        tags: [
          { name: ArweaveTags.author, value: recoveredAddress },
          { name: ArweaveTags.type, value: ArweaveTransactionTypes.profile },
        ],
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

/**
 * `@effect/platform-node` fails the body read with this message once the
 * `MaxBodySize` limit is exceeded, wrapped in an `HttpServerError`.
 */
const MAX_BODY_SIZE_CAUSE_MESSAGE = "maxBytes exceeded";

const isBodyTooLargeError = (error: HttpServerError.HttpServerError): boolean =>
  Predicate.isTagged(error.reason, "RequestParseError") &&
  error.reason.cause instanceof Error &&
  error.reason.cause.message === MAX_BODY_SIZE_CAUSE_MESSAGE;

const readImageBody = (
  request: HttpServerRequest.HttpServerRequest,
  maxMib: number,
) =>
  request.arrayBuffer.pipe(
    Effect.provideService(
      HttpServerRequest.MaxBodySize,
      ByteSize.mebibytes(maxMib),
    ),
    Effect.map((buffer) => new Uint8Array(buffer)),
    Effect.tapError((error) =>
      Effect.logWarning("Failed to read profile image body", { cause: error }),
    ),
    Effect.mapError((error) =>
      isBodyTooLargeError(error)
        ? new PayloadTooLarge({
            message: `Image is too large, maximum size is ${maxMib} MiB.`,
          })
        : new BadRequest({ message: "Failed to read request body." }),
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
    const images = yield* ImageProcessingService;
    const posthog = yield* PostHogService;

    const contentType = normalizeContentType(
      request.headers["content-type"] ?? "",
    );

    if (!isAllowedImageFormat(contentType)) {
      return yield* new UnsupportedMediaType({
        message: `Unsupported image format: ${contentType}`,
      });
    }

    const maxMib = profileImageMaxMib(kind);
    const declaredSize = Number(request.headers["content-length"] ?? "");

    if (
      Number.isFinite(declaredSize) &&
      declaredSize > profileImageMaxBytes(kind)
    ) {
      return yield* new PayloadTooLarge({
        message: `Image is too large, maximum size is ${maxMib} MiB.`,
      });
    }

    const buffer = yield* readImageBody(request, maxMib);

    if (buffer.length === 0) {
      return yield* new BadRequest({ message: "No image provided" });
    }

    const detected = yield* detectImageFormat(buffer).pipe(
      Effect.orElseSucceed(() => Option.none()),
    );

    if (Option.isNone(detected)) {
      return yield* new UnsupportedMediaType({ message: "Invalid image file" });
    }

    if (mimeTypeForSharpFormat(detected.value) === undefined) {
      return yield* new UnsupportedMediaType({
        message: `Unsupported image format: ${detected.value}`,
      });
    }

    const { quality, width } = profileImageSettings(config.STACKS_ENV, kind);

    const optimized = yield* images.optimize({ buffer, quality, width }).pipe(
      Effect.tapError((error) =>
        Effect.logWarning("Failed to optimize profile image", {
          cause: error,
          contentType,
          kind,
        }),
      ),
      Effect.mapError((error) =>
        Predicate.isTagged(error, "ImageProcessingTimeoutError")
          ? new InternalServerError({ message: "Image processing timed out." })
          : new BadRequest({ message: "Failed to optimize image." }),
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
