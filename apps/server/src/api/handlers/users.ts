import { eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { DateTime, Effect } from "effect";
import { HttpApiBuilder, HttpApiSchema } from "effect/http-api";
import { SigleApi } from "@/api";
import { PUBLIC_CACHE_CONTROL } from "@/api/middleware/etag";
import { NotFound } from "@/api/schemas";
import { Database } from "@/db";
import { mediaImage, profile, walletAddress } from "@/db/schema";
import { parseStacksAddress } from "@/lib/stacks-address";

const pictureImage = alias(mediaImage, "picture_image");

const coverPictureImage = alias(mediaImage, "cover_picture_image");

/**
 * Reads the profiles published by addresses, with the placeholders of their
 * images. Addresses that never published a profile are missing from the
 * returned map.
 */
export const findProfiles = (addresses: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const rows =
      addresses.length === 0
        ? []
        : yield* db
            .select({
              profile,
              pictureThumbhash: pictureImage.thumbhash,
              pictureWidth: pictureImage.width,
              pictureHeight: pictureImage.height,
              coverThumbhash: coverPictureImage.thumbhash,
              coverWidth: coverPictureImage.width,
              coverHeight: coverPictureImage.height,
            })
            .from(profile)
            .leftJoin(pictureImage, eq(pictureImage.id, profile.picture))
            .leftJoin(
              coverPictureImage,
              eq(coverPictureImage.id, profile.coverPicture),
            )
            .where(inArray(profile.address, [...addresses]))
            .pipe(Effect.orDie);

    return new Map(
      rows.map((found) => {
        const foundProfile = found.profile;

        return [
          foundProfile.address,
          {
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
        ] as const;
      }),
    );
  });

/**
 * Reads the profile published by an address, see {@link findProfiles}.
 * `undefined` when the address never published a profile.
 */
export const findProfile = (address: string) =>
  Effect.map(findProfiles([address]), (profiles) => profiles.get(address));

export const getUserProfile = (addressParam: string) =>
  Effect.gen(function* () {
    const address = yield* parseStacksAddress(addressParam);
    const db = yield* Database;
    const found = yield* findProfile(address);

    // Profiles are keyed by the signing address, so an address is known when
    // it either published a profile or signed in without publishing one.
    if (!found) {
      const [wallet] = yield* db
        .select({ id: walletAddress.id })
        .from(walletAddress)
        .where(eq(walletAddress.address, address))
        .limit(1)
        .pipe(Effect.orDie);

      if (!wallet) {
        return yield* new NotFound({ message: "User not found" });
      }

      return HttpApiSchema.withHeaders({
        body: { address, profile: null },
        headers: { "cache-control": PUBLIC_CACHE_CONTROL },
      });
    }

    return HttpApiSchema.withHeaders({
      body: { address, profile: found.profile },
      headers: { "cache-control": PUBLIC_CACHE_CONTROL },
    });
  });

export const UsersHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "users",
  (handlers) =>
    handlers.handle("get", ({ params }) => getUserProfile(params.address)),
);
