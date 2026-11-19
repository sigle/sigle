import { validateStacksAddress } from "@stacks/transactions";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { DateTime, Effect } from "effect";
import { HttpApiBuilder, HttpApiSchema } from "effect/http-api";
import { SigleApi } from "@/api";
import { BadRequest, NotFound } from "@/api/schemas";
import { Database } from "@/db";
import { mediaImage, profile, walletAddress } from "@/db/schema";

const CACHE_CONTROL = "public, max-age=60";

const pictureImage = alias(mediaImage, "picture_image");

const coverPictureImage = alias(mediaImage, "cover_picture_image");

export const getUserProfile = (username: string) =>
  Effect.gen(function* () {
    if (!validateStacksAddress(username)) {
      return yield* new BadRequest({ message: "Invalid Stacks address" });
    }

    const db = yield* Database;

    const [found] = yield* db
      .select({
        profile,
        pictureThumbhash: pictureImage.thumbhash,
        pictureWidth: pictureImage.width,
        pictureHeight: pictureImage.height,
        pictureUpdatedAt: pictureImage.updatedAt,
        coverThumbhash: coverPictureImage.thumbhash,
        coverWidth: coverPictureImage.width,
        coverHeight: coverPictureImage.height,
        coverUpdatedAt: coverPictureImage.updatedAt,
      })
      .from(profile)
      .leftJoin(pictureImage, eq(pictureImage.id, profile.picture))
      .leftJoin(
        coverPictureImage,
        eq(coverPictureImage.id, profile.coverPicture),
      )
      .where(eq(profile.address, username))
      .limit(1)
      .pipe(Effect.orDie);

    // Profiles are keyed by the signing address, so an address is known when
    // it either published a profile or signed in without publishing one.
    if (!found) {
      const [wallet] = yield* db
        .select({ id: walletAddress.id })
        .from(walletAddress)
        .where(eq(walletAddress.address, username))
        .limit(1)
        .pipe(Effect.orDie);

      if (!wallet) {
        return yield* new NotFound({ message: "User not found" });
      }

      return HttpApiSchema.withHeaders({
        body: { address: username, profile: null },
        headers: { "cache-control": CACHE_CONTROL, etag: `"none"` },
      });
    }

    const foundProfile = found.profile;

    // The thumbnail is filled in asynchronously after the profile metadata is
    // stored, so its `updatedAt` is part of the ETag to invalidate caches when
    // the placeholder becomes available.
    const mediaUpdatedAt = [found.pictureUpdatedAt, found.coverUpdatedAt]
      .flatMap((date) => (date === null ? [] : [date.getTime()]))
      .sort((first, second) => first - second)
      .join(".");

    const etag = `"${foundProfile.arweaveTxId}${mediaUpdatedAt === "" ? "" : `-${mediaUpdatedAt}`}"`;

    return HttpApiSchema.withHeaders({
      body: {
        address: username,
        profile: {
          displayName: foundProfile.displayName,
          description: foundProfile.description,
          website: foundProfile.website,
          twitter: foundProfile.twitter,
          picture:
            foundProfile.picture === null
              ? null
              : {
                  url: foundProfile.picture,
                  width: found.pictureWidth,
                  height: found.pictureHeight,
                  thumbhash: found.pictureThumbhash,
                },
          coverPicture:
            foundProfile.coverPicture === null
              ? null
              : {
                  url: foundProfile.coverPicture,
                  width: found.coverWidth,
                  height: found.coverHeight,
                  thumbhash: found.coverThumbhash,
                },
          arweaveTxId: foundProfile.arweaveTxId,
          updatedAt: DateTime.fromDateUnsafe(foundProfile.updatedAt),
        },
      },
      headers: {
        "cache-control": CACHE_CONTROL,
        etag,
      },
    });
  });

export const UsersHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "users",
  (handlers) =>
    handlers.handle("get", ({ params }) => getUserProfile(params.username)),
);
