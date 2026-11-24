import type { HttpServerRequest } from "effect/http";
import { eq } from "drizzle-orm";
import { Effect, Option, Predicate, Schema } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { SigleApi } from "@/api";
import {
  ProfileDescription,
  ProfileDisplayName,
  ProfilePicture,
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
import { profile } from "@/db/schema";
import { scheduleImageThumbhash } from "@/jobs/generate-image-thumbhash";
import {
  profileImageKey,
  profileImageMaxMib,
  profileImagePostHogEvent,
  profileImageSettings,
  type ProfileImageKind,
} from "@/lib/profile-images";
import { BnsService } from "@/services/bns";
import { PostHogService } from "@/services/posthog";

interface ProfilePictures {
  readonly picture: string | null;
  readonly coverPicture: string | null;
}

/**
 * Externally hosted pictures bypass the image upload endpoint, so every
 * profile write schedules the placeholder of the pictures it changes.
 */
const scheduleChangedProfileImages = (
  previous: ProfilePictures | undefined,
  next: ProfilePictures,
) => {
  const changed = new Set<string>();

  if (next.picture !== null && next.picture !== previous?.picture) {
    changed.add(next.picture);
  }

  if (
    next.coverPicture !== null &&
    next.coverPicture !== previous?.coverPicture
  ) {
    changed.add(next.coverPicture);
  }

  return Effect.forEach(changed, scheduleImageThumbhash, { discard: true });
};

export const updateProfile = (payload: typeof UpdateProfilePayload.Type) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;
    const posthog = yield* PostHogService;

    const now = new Date();

    const fields = {
      displayName: payload.displayName ?? null,
      description: payload.description ?? null,
      website: payload.website ?? null,
      twitter: payload.twitter ?? null,
      picture: payload.picture ?? null,
      coverPicture: payload.coverPicture ?? null,
      updatedAt: now,
    };

    const previous = yield* db
      .transaction((tx) =>
        Effect.gen(function* () {
          const [found] = yield* tx
            .select({
              picture: profile.picture,
              coverPicture: profile.coverPicture,
            })
            .from(profile)
            .where(eq(profile.address, user.address))
            .limit(1);

          yield* tx
            .insert(profile)
            .values({ ...fields, address: user.address, createdAt: now })
            .onConflictDoUpdate({ target: profile.address, set: fields });

          return found;
        }),
      )
      // Like the queries, a failed transaction is a defect.
      .pipe(Effect.orDie);

    yield* scheduleChangedProfileImages(previous, fields);

    yield* posthog.capture({
      distinctId: user.id,
      event: "profile updated",
    });

    const stored = yield* findProfile(user.address);

    if (stored === undefined) {
      return yield* Effect.die(
        new Error(`Profile ${user.address} missing after upsert`),
      );
    }

    return { address: user.address, profile: stored.profile };
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
    pfp: Schema.optionalKey(Schema.Unknown),
    social: Schema.optionalKey(Schema.Unknown),
  }),
);

const BnsSocial = Schema.Array(
  Schema.Struct({ platform: Schema.Unknown, username: Schema.Unknown }),
);

const decodeBnsZonefile = Schema.decodeUnknownOption(BnsZonefile);

const decodeBnsSocial = Schema.decodeUnknownOption(BnsSocial);

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

  const { name, bio, website, pfp, social } = decoded.value;

  const twitter = Option.getOrElse(decodeBnsSocial(social), () => []).find(
    (entry) =>
      Predicate.isString(entry.platform) &&
      ["twitter", "x"].includes(entry.platform.toLowerCase()),
  );

  // Zonefiles often store a website without its protocol, such as
  // `example.com`.
  const websiteText = stringOrUndefined(website)?.trim();

  const websiteUrl =
    websiteText === undefined || /^[a-z]+:/i.test(websiteText)
      ? websiteText
      : `https://${websiteText}`;

  const fields = {
    displayName: readField(ProfileDisplayName, stringOrUndefined(name)),
    description: readField(ProfileDescription, stringOrUndefined(bio)),
    website: readField(ProfileWebsite, websiteUrl),
    twitter: readField(
      ProfileTwitter,
      stringOrUndefined(twitter?.username)?.trim().replace(/^@/, ""),
    ),
    picture: readField(ProfilePicture, stringOrUndefined(pfp)),
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
      key: (version) => profileImageKey(user.id, kind, version),
      url: (stored) => stored.url,
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
      .handle("bns", () => getBnsProfile)
      .handle("uploadImage", ({ params, request }) =>
        uploadProfileImage(params.kind, request),
      ),
);
