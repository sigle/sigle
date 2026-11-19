import type { HttpServerRequest } from "effect/http";
import {
  ArweaveTags,
  ArweaveTransactionTypes,
  verifyMetadataSignature,
} from "@sigle/sdk";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import type { UploadProfileMetadataPayload } from "@/api/groups/profile";
import { SigleApi } from "@/api";
import { uploadImageFromRequest } from "@/api/image-upload";
import { CurrentUser } from "@/api/middleware/auth-user";
import { BadRequest, InternalServerError } from "@/api/schemas";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { profile } from "@/db/schema";
import { scheduleChangedProfileImages } from "@/jobs/index-profile";
import {
  profileImageKey,
  profileImageMaxMib,
  profileImagePostHogEvent,
  profileImageSettings,
  type ProfileImageKind,
  versionProfileImageUrl,
} from "@/lib/profile-images";
import { ArweaveService } from "@/services/arweave";
import { PostHogService } from "@/services/posthog";

export const uploadProfileMetadata = (
  payload: typeof UploadProfileMetadataPayload.Type,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const config = yield* AppConfig;
    const db = yield* Database;
    const arweave = yield* ArweaveService;
    const posthog = yield* PostHogService;

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

    if (!user.walletAddresses.includes(recoveredAddress)) {
      return yield* new BadRequest({
        message:
          "Invalid signature: Signature verification failed or address mismatch",
      });
    }

    const [existingProfileWithSignature] = yield* db
      .select({ address: profile.address })
      .from(profile)
      .where(eq(profile.signature, signature))
      .limit(1)
      .pipe(Effect.orDie);

    if (existingProfileWithSignature) {
      return yield* new BadRequest({
        message: "Metadata signature has already been published",
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
        // ArweaveService logs the cause, the client only gets a generic message.
        Effect.mapError(
          () =>
            new InternalServerError({
              message: "Failed to upload to Arweave.",
            }),
        ),
      );

    const now = new Date();
    const { content } = payload.metadata;

    const [existingProfile] = yield* db
      .select({
        coverPicture: profile.coverPicture,
        picture: profile.picture,
      })
      .from(profile)
      .where(eq(profile.address, recoveredAddress))
      .limit(1)
      .pipe(Effect.orDie);

    // Store the signed metadata on upload so the profile is immediately
    // readable. The profile indexer sets the block once the transaction is
    // mined.
    const profileFields = {
      arweaveTxId: result.id,
      arweaveBlockHeight: null,
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
        address: recoveredAddress,
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: profile.address,
        set: profileFields,
      })
      .pipe(Effect.orDie);

    yield* scheduleChangedProfileImages(existingProfile, profileFields);

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
  kind: ProfileImageKind,
  request: HttpServerRequest.HttpServerRequest,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const config = yield* AppConfig;
    const posthog = yield* PostHogService;

    const uploaded = yield* uploadImageFromRequest(request, {
      ...profileImageSettings(config.STACKS_ENV, kind),
      maxMib: profileImageMaxMib(kind),
      key: () => profileImageKey(user.id, kind),
      url: (stored) => versionProfileImageUrl(stored.url, stored.version),
    });

    yield* posthog.capture({
      distinctId: user.id,
      event: profileImagePostHogEvent(kind),
      properties: {
        key: uploaded.key,
        sizeBytes: uploaded.sizeBytes,
        url: uploaded.url,
      },
    });

    return {
      height: uploaded.height,
      key: uploaded.key,
      thumbhash: uploaded.thumbhash,
      url: uploaded.url,
      width: uploaded.width,
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
