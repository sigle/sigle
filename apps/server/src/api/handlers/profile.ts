import type { HttpServerRequest } from "effect/http";
import {
  ArweaveTags,
  ArweaveTransactionTypes,
  verifyMetadataSignature,
} from "@sigle/sdk";
import { eq } from "drizzle-orm";
import { Duration, Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { SigleApi } from "@/api";
import {
  PROFILE_METADATA_MAX_KIB,
  type UpdateProfilePayload,
} from "@/api/groups/profile";
import { findProfile } from "@/api/handlers/users";
import { uploadImageFromRequest } from "@/api/image-upload";
import { CurrentUser } from "@/api/middleware/auth-user";
import { setRetryAfterHeader } from "@/api/middleware/rate-limit";
import {
  BadRequest,
  Conflict,
  InternalServerError,
  PayloadTooLarge,
  TooManyRequests,
} from "@/api/schemas";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { profile, profileUpdate } from "@/db/schema";
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
import { findProfileUpdateUsage, PROFILE_UPDATE_LIMIT } from "@/services/plan";
import { PostHogService } from "@/services/posthog";

/** Signatures of the profile metadata being uploaded by this process. */
const uploadingSignatures = new Set<string>();

/**
 * Runs `effect` while holding the upload claim on `signature`, or fails with a
 * 409 when another request holds it.
 */
const withUploadClaim = <A, E, R>(
  signature: string,
  effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, E | Conflict, R> =>
  Effect.acquireUseRelease(
    Effect.sync(() => {
      if (uploadingSignatures.has(signature)) {
        return false;
      }

      uploadingSignatures.add(signature);

      return true;
    }),
    (claimed): Effect.Effect<A, E | Conflict, R> =>
      claimed
        ? effect
        : Effect.fail(
            new Conflict({
              message: "Metadata signature is already being published",
            }),
          ),
    (claimed) =>
      Effect.sync(() => {
        if (claimed) {
          uploadingSignatures.delete(signature);
        }
      }),
  );

export const updateProfile = (payload: typeof UpdateProfilePayload.Type) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const config = yield* AppConfig;
    const db = yield* Database;
    const arweave = yield* ArweaveService;
    const posthog = yield* PostHogService;

    const file = Buffer.from(JSON.stringify(payload.metadata));

    if (file.length > PROFILE_METADATA_MAX_KIB * 1024) {
      return yield* new PayloadTooLarge({
        message: `Profile metadata is too large, maximum size is ${PROFILE_METADATA_MAX_KIB} KiB.`,
      });
    }

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

    // A soft limit, like the publish limit: an update only counts once it is
    // stored, so updates whose Arweave upload is still running are not
    // counted. The per-minute limit and the upload timeout keep the overshoot
    // to a few updates.
    const checkedAt = new Date();

    const usage = yield* findProfileUpdateUsage(db, {
      userId: user.id,
      now: checkedAt,
    });

    if (usage.used >= PROFILE_UPDATE_LIMIT) {
      const retryAfterMillis = Math.max(
        0,
        (usage.resetsAt?.getTime() ?? checkedAt.getTime()) -
          checkedAt.getTime(),
      );

      yield* setRetryAfterHeader(Duration.millis(retryAfterMillis));

      return yield* new TooManyRequests({
        message: `You can update your profile ${PROFILE_UPDATE_LIMIT} times per day. Try again later.`,
        retryAfterMillis,
      });
    }

    // Concurrent requests with the same signed metadata would all pass the
    // signature check and each pay for an Arweave upload. A claim on the
    // signature is held until the profile is stored, so the other requests
    // get a 409 instead of waiting for it. The claim lives in this process:
    // the server runs as a single instance on its SQLite database. The upload
    // runs outside any transaction, which would hold the database's only
    // connection for its whole duration.
    const { result, existingProfile, profileFields } = yield* withUploadClaim(
      signature,
      Effect.gen(function* () {
        const [existingProfileWithSignature] = yield* db
          .select({ address: profile.address })
          .from(profile)
          .where(eq(profile.signature, signature))
          .limit(1)
          .pipe(Effect.orDie);

        if (existingProfileWithSignature) {
          return yield* new Conflict({
            message: "Metadata signature has already been published",
          });
        }

        const uploaded = yield* arweave
          .uploadFile({
            file,
            contentType: "application/json",
            tags: [
              { name: ArweaveTags.author, value: recoveredAddress },
              {
                name: ArweaveTags.type,
                value: ArweaveTransactionTypes.profile,
              },
            ],
          })
          .pipe(
            // ArweaveService logs the cause, the client only gets a generic
            // message.
            Effect.mapError(
              () =>
                new InternalServerError({
                  message: "Failed to upload to Arweave.",
                }),
            ),
          );

        const now = new Date();
        const { content } = payload.metadata;

        // Store the signed metadata on upload so the profile is immediately
        // readable. The profile indexer sets the block once the transaction
        // is mined.
        const fields = {
          arweaveTxId: uploaded.id,
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

        const previousProfile = yield* db
          .transaction((tx) =>
            Effect.gen(function* () {
              const [previous] = yield* tx
                .select({
                  coverPicture: profile.coverPicture,
                  picture: profile.picture,
                })
                .from(profile)
                .where(eq(profile.address, recoveredAddress))
                .limit(1);

              yield* tx
                .insert(profile)
                .values({
                  ...fields,
                  address: recoveredAddress,
                  createdAt: now,
                })
                .onConflictDoUpdate({
                  target: profile.address,
                  set: fields,
                });

              yield* tx.insert(profileUpdate).values({
                arweaveTxId: uploaded.id,
                userId: user.id,
                address: recoveredAddress,
              });

              return previous;
            }),
          )
          // Like the queries, a failed transaction is a defect.
          .pipe(Effect.orDie);

        return {
          result: uploaded,
          existingProfile: previousProfile,
          profileFields: fields,
        };
      }),
    );

    yield* scheduleChangedProfileImages(existingProfile, profileFields);

    yield* posthog.capture({
      distinctId: user.id,
      event: "profile metadata uploaded",
      properties: {
        arweaveId: result.id,
      },
    });

    const stored = yield* findProfile(recoveredAddress);

    if (stored === undefined) {
      return yield* Effect.die(
        new Error(`Profile ${recoveredAddress} missing after upsert`),
      );
    }

    return {
      arweaveTxId: result.id,
      uri: result.uri,
      cid: result.cid,
      gatewayUrl: result.gatewayUrl,
      address: recoveredAddress,
      profile: stored.profile,
    };
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
      sizeBytes: uploaded.sizeBytes,
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
      .handle("update", ({ payload }) => updateProfile(payload))
      .handle("uploadImage", ({ params, request }) =>
        uploadProfileImage(params.kind, request),
      ),
);
