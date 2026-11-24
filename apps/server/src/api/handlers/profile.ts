import type { HttpServerRequest } from "effect/http";
import { eq } from "drizzle-orm";
import { Effect, Option, Predicate, Schema } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { SigleApi } from "@/api";
import {
  ProfileDescription,
  ProfileDisplayName,
  ProfileTwitter,
  ProfileWebsite,
  type UpdateProfilePayload,
} from "@/api/groups/profile";
import { findProfile } from "@/api/handlers/users";
import { uploadImageFromRequest } from "@/api/image-upload";
import { CurrentUser } from "@/api/middleware/auth-user";
import { InternalServerError } from "@/api/schemas";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { mediaImage, profile } from "@/db/schema";
import {
  profileImageKey,
  profileImageMaxMib,
  profileImagePostHogEvent,
  profileImagePrefix,
  profileImageSettings,
  type ProfileImageKind,
} from "@/lib/profile-images";
import { BnsService } from "@/services/bns";
import { PostHogService } from "@/services/posthog";
import { StorageService } from "@/services/storage";

/** The stored profile of the signed-in user, after a write. */
const findOwnProfile = (address: string) =>
  Effect.gen(function* () {
    const stored = yield* findProfile(address);

    if (stored === undefined) {
      return yield* Effect.die(
        new Error(`Profile ${address} missing after upsert`),
      );
    }

    return { address, profile: stored.profile };
  });

export const updateProfile = (payload: typeof UpdateProfilePayload.Type) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;
    const posthog = yield* PostHogService;

    const now = new Date();

    // The avatar and cover are kept: they are set by uploading them.
    const fields = {
      displayName: payload.displayName ?? null,
      description: payload.description ?? null,
      website: payload.website ?? null,
      twitter: payload.twitter ?? null,
      updatedAt: now,
    };

    yield* db
      .insert(profile)
      .values({ ...fields, address: user.address, createdAt: now })
      .onConflictDoUpdate({ target: profile.address, set: fields })
      .pipe(Effect.orDie);

    yield* posthog.capture({
      distinctId: user.id,
      event: "profile updated",
    });

    return yield* findOwnProfile(user.address);
  });

/**
 * The profile fields of a BNS V2 zonefile, see
 * https://github.com/Strata-Labs/bns-v2-sdk (`NewZonefileData`). Fields are
 * read as unknown and checked one by one, so one invalid field doesn't hide
 * the others.
 */
const BnsZonefile = Schema.fromJsonString(
  Schema.Struct({
    owner: Schema.String,
    name: Schema.optionalKey(Schema.Unknown),
    bio: Schema.optionalKey(Schema.Unknown),
    website: Schema.optionalKey(Schema.Unknown),
    social: Schema.optionalKey(Schema.Unknown),
  }),
);

const BnsSocial = Schema.Array(Schema.Unknown);

const BnsSocialEntry = Schema.Struct({
  platform: Schema.Unknown,
  username: Schema.Unknown,
});

const decodeBnsZonefile = Schema.decodeUnknownOption(BnsZonefile);

const decodeBnsSocial = Schema.decodeUnknownOption(BnsSocial);

const decodeBnsSocialEntry = Schema.decodeUnknownOption(BnsSocialEntry);

/** The trimmed value when it is valid for `schema` and not empty, else null. */
const readField = <S extends Schema.Codec<string, string>>(
  schema: S,
  value: string | undefined,
): string | null => {
  const trimmed = value?.trim() ?? "";

  return trimmed === ""
    ? null
    : Option.getOrNull(Schema.decodeOption(schema)(trimmed));
};

const stringOrUndefined = <A>(value: A) =>
  Predicate.isString(value) ? value : undefined;

/**
 * Reads the profile fields of a zonefile. Null when it isn't a JSON profile
 * zonefile, when it was written for another owner of the name, or when none
 * of its fields can be imported.
 */
export const parseBnsProfile = (zonefile: string, owner: string) => {
  const decoded = decodeBnsZonefile(zonefile);

  // A transferred name keeps the zonefile of its previous owner until the new
  // owner replaces it.
  if (Option.isNone(decoded) || decoded.value.owner !== owner) {
    return null;
  }

  // `pfp` isn't imported: profile images are only set by uploading them.
  const { name, bio, website, social } = decoded.value;

  // The first valid X handle, skipping malformed entries.
  const twitter =
    Option.getOrElse(decodeBnsSocial(social), () => [])
      .flatMap((value) => Option.toArray(decodeBnsSocialEntry(value)))
      .filter(
        (entry) =>
          Predicate.isString(entry.platform) &&
          ["twitter", "x"].includes(entry.platform.toLowerCase()),
      )
      .map((entry) =>
        readField(
          ProfileTwitter,
          stringOrUndefined(entry.username)?.trim().replace(/^@/, ""),
        ),
      )
      .find((handle) => handle !== null) ?? null;

  // Zonefiles often store a website without its protocol, such as
  // `example.com`. A colon followed by a port, as in `example.com:8443`,
  // isn't a scheme; any other scheme is kept and validated as is.
  const websiteText = stringOrUndefined(website)?.trim();

  const websiteUrl =
    websiteText === undefined ||
    /^[a-z][a-z\d+.-]*:(?!\d+(?:[/?#]|$))/i.test(websiteText)
      ? websiteText
      : `https://${websiteText}`;

  const fields = {
    displayName: readField(ProfileDisplayName, stringOrUndefined(name)),
    description: readField(ProfileDescription, stringOrUndefined(bio)),
    website: readField(ProfileWebsite, websiteUrl),
    twitter,
  };

  return Object.values(fields).every((value) => value === null) ? null : fields;
};

export const getBnsProfile = Effect.gen(function* () {
  const user = yield* CurrentUser;
  const bns = yield* BnsService;

  const name = yield* bns.findPrimaryName(user.address).pipe(
    Effect.tapError((error) =>
      Effect.logWarning("Failed to read the BNS name", { cause: error }),
    ),
    Effect.mapError(
      () =>
        new InternalServerError({
          message: "Failed to read your BNS name, please try again.",
        }),
    ),
  );

  if (name === null) {
    return { name: null, profile: null };
  }

  return {
    name: name.fullName,
    profile:
      name.zonefile === null
        ? null
        : parseBnsProfile(name.zonefile, user.address),
  };
});

/**
 * Uploads an avatar or cover and sets it on the profile right away, then
 * deletes the image it replaces: profile images are keyed by their content
 * hash, so the replaced object is no longer used by any profile.
 */
export const uploadProfileImage = (
  kind: ProfileImageKind,
  request: HttpServerRequest.HttpServerRequest,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const config = yield* AppConfig;
    const db = yield* Database;
    const storage = yield* StorageService;
    const posthog = yield* PostHogService;

    const uploaded = yield* uploadImageFromRequest(request, {
      ...profileImageSettings(config.STACKS_ENV, kind),
      maxMib: profileImageMaxMib(kind),
      key: (version) => profileImageKey(user.id, kind, version),
      url: (stored) => stored.url,
    });

    const now = new Date();
    const column = kind === "avatar" ? profile.picture : profile.coverPicture;

    const image =
      kind === "avatar"
        ? { picture: uploaded.url }
        : { coverPicture: uploaded.url };

    const previousUrl = yield* db
      .transaction((tx) =>
        Effect.gen(function* () {
          const [previous] = yield* tx
            .select({ url: column })
            .from(profile)
            .where(eq(profile.address, user.address))
            .limit(1);

          yield* tx
            .insert(profile)
            .values({
              ...image,
              address: user.address,
              createdAt: now,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: profile.address,
              set: { ...image, updatedAt: now },
            });

          return previous?.url ?? null;
        }),
      )
      .pipe(Effect.orDie);

    // Only images this endpoint stored for this user and kind are deleted, not
    // external pictures or the images of profiles published on Arweave.
    const publicUrl = uploaded.url.slice(0, -uploaded.key.length);
    const previousKey = previousUrl?.slice(publicUrl.length);

    if (
      previousUrl !== null &&
      previousUrl !== uploaded.url &&
      previousUrl.startsWith(publicUrl) &&
      previousKey?.startsWith(profileImagePrefix(user.id, kind)) === true
    ) {
      // The profile is saved already, a failed delete only leaves an unused
      // row or object behind, so it's logged and the upload still succeeds.
      yield* db
        .delete(mediaImage)
        .where(eq(mediaImage.id, previousUrl))
        .pipe(
          Effect.tapError((cause) =>
            Effect.logError("Failed to delete a replaced profile image", {
              cause,
              url: previousUrl,
            }),
          ),
          Effect.ignore,
        );

      // The storage service logs its failures.
      yield* storage.deleteFile(previousKey).pipe(Effect.ignore);
    }

    yield* posthog.capture({
      distinctId: user.id,
      event: profileImagePostHogEvent(kind),
      properties: {
        key: uploaded.key,
        sizeBytes: uploaded.sizeBytes,
        url: uploaded.url,
      },
    });

    return yield* findOwnProfile(user.address);
  });

export const ProfileHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "profile",
  (handlers) =>
    handlers
      .handle("update", ({ payload }) => updateProfile(payload))
      .handle("bns", () => getBnsProfile)
      .handle("uploadImage", ({ params, request }) =>
        uploadProfileImage(params.kind, request),
      ),
);
