import { validateStacksAddress } from "@stacks/transactions";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { DateTime, Effect } from "effect";
import { HttpApiBuilder, HttpApiSchema } from "effect/http-api";
import { SigleApi } from "@/api";
import { BadRequest, NotFound } from "@/api/schemas";
import { Database } from "@/db";
import { mediaImage, profile, user, walletAddress } from "@/db/schema";

const CACHE_CONTROL = "public, max-age=60";

const pictureImage = alias(mediaImage, "picture_image");

const coverPictureImage = alias(mediaImage, "cover_picture_image");

export const getUserProfile = (username: string) =>
  Effect.gen(function* () {
    if (!validateStacksAddress(username)) {
      return yield* new BadRequest({ message: "Invalid Stacks address" });
    }

    const db = yield* Database;

    const [foundUser] = yield* db
      .select({
        userId: user.id,
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
      .from(user)
      .innerJoin(walletAddress, eq(walletAddress.userId, user.id))
      .leftJoin(profile, eq(profile.userId, user.id))
      .leftJoin(pictureImage, eq(pictureImage.id, profile.picture))
      .leftJoin(
        coverPictureImage,
        eq(coverPictureImage.id, profile.coverPicture),
      )
      .where(eq(walletAddress.address, username))
      .limit(1)
      .pipe(Effect.orDie);

    if (!foundUser) {
      return yield* new NotFound({ message: "User not found" });
    }

    const foundProfile = foundUser.profile;

    // The thumbnail is filled in asynchronously after the profile metadata is
    // stored, so its `updatedAt` is part of the ETag to invalidate caches when
    // the placeholder becomes available.
    const mediaUpdatedAt = [
      foundUser.pictureUpdatedAt,
      foundUser.coverUpdatedAt,
    ]
      .flatMap((date) => (date === null ? [] : [date.getTime()]))
      .sort((first, second) => first - second)
      .join(".");

    const etag = foundProfile
      ? `"${foundProfile.arweaveTxId}${mediaUpdatedAt === "" ? "" : `-${mediaUpdatedAt}`}"`
      : `"none"`;

    return HttpApiSchema.withHeaders({
      body: {
        address: username,
        profile:
          foundProfile === null
            ? null
            : {
                displayName: foundProfile.displayName,
                description: foundProfile.description,
                website: foundProfile.website,
                twitter: foundProfile.twitter,
                picture:
                  foundProfile.picture === null
                    ? null
                    : {
                        url: foundProfile.picture,
                        width: foundUser.pictureWidth,
                        height: foundUser.pictureHeight,
                        thumbhash: foundUser.pictureThumbhash,
                      },
                coverPicture:
                  foundProfile.coverPicture === null
                    ? null
                    : {
                        url: foundProfile.coverPicture,
                        width: foundUser.coverWidth,
                        height: foundUser.coverHeight,
                        thumbhash: foundUser.coverThumbhash,
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
