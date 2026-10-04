import {
  ArweaveTags,
  ArweaveTransactionTypes,
  verifyMetadataSignature,
} from "@sigle/sdk";
import { eq } from "drizzle-orm";
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
import { Database } from "@/db";
import { profile } from "@/db/schema";
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
    const db = yield* Database;
    const arweave = yield* ArweaveService;
    const posthog = yield* PostHogService;
    const whitelist = yield* UserWhitelistService;

    // Verify that the signature is valid and belongs to a wallet owned by the logged-in user
    const signatureResult = verifyMetadataSignature(payload.metadata, {
      network: config.STACKS_ENV === "mainnet" ? "mainnet" : "testnet",
    });

    if (signatureResult.isErr()) {
      return yield* new BadRequest({
        message: signatureResult.error.error,
      });
    }

    const { recoveredAddress, signature } = signatureResult.value;

    const wallet = yield* whitelist.getWalletAddress(user.id, recoveredAddress);

    if (Option.isNone(wallet)) {
      return yield* new BadRequest({
        message:
          "Invalid signature: Signature verification failed or address mismatch",
      });
    }

    const { content } = payload.metadata;
    // The metadata id is regenerated on every save, so it is excluded from the
    // hash used to detect no-op saves.
    const { id: _contentId, ...hashableContent } = content;
    const contentHash = sha256Hex(Buffer.from(JSON.stringify(hashableContent)));

    const [existingProfile] = yield* db
      .select()
      .from(profile)
      .where(eq(profile.userId, user.id))
      .limit(1)
      .pipe(Effect.orDie);

    const gatewayUrl = config.ARWEAVE_GATEWAY_URL.replace(/\/+$/, "");

    // Skip the Arweave upload when the signed content is unchanged.
    if (existingProfile && existingProfile.contentHash === contentHash) {
      return {
        id: existingProfile.arweaveTxId,
        uri: `ar://${existingProfile.arweaveTxId}`,
        cid: existingProfile.arweaveCid,
        gatewayUrl: `${gatewayUrl}/${existingProfile.arweaveTxId}`,
      };
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

    const now = new Date();

    // Store the signed metadata on upload so the profile is immediately
    // readable.
    const profileFields = {
      walletAddressId: wallet.value.id,
      arweaveTxId: result.id,
      arweaveCid: result.cid,
      contentHash,
      signature,
      displayName: content.displayName ?? null,
      description: content.description ?? null,
      website: content.website ?? null,
      twitter: content.twitter ?? null,
      picture: content.picture ?? null,
      coverPicture: content.coverPicture ?? null,
      updatedAt: now,
    };

    yield* db
      .insert(profile)
      .values({
        ...profileFields,
        userId: user.id,
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: profile.userId,
        set: profileFields,
      })
      .pipe(Effect.orDie);

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
