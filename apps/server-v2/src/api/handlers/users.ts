import { count, eq } from "drizzle-orm";
import { DateTime, Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { SigleApi } from "@/api";
import { NotFound } from "@/api/schemas";
import { Database } from "@/db";
import { post, profile, user, walletAddress } from "@/db/schema";

export const getUserProfile = (username: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [foundUser] = yield* db
      .select({
        userId: user.id,
        profile,
      })
      .from(user)
      .innerJoin(walletAddress, eq(walletAddress.userId, user.id))
      .leftJoin(profile, eq(profile.userId, user.id))
      .where(eq(walletAddress.address, username))
      .limit(1)
      .pipe(Effect.orDie);

    if (!foundUser) {
      return yield* new NotFound({ message: "User not found" });
    }

    const [totals] = yield* db
      .select({ count: count() })
      .from(post)
      .where(eq(post.userId, foundUser.userId))
      .pipe(Effect.orDie);

    const foundProfile = foundUser.profile;

    return {
      address: username,
      profile:
        foundProfile === null
          ? null
          : {
              displayName: foundProfile.displayName,
              description: foundProfile.description,
              website: foundProfile.website,
              twitter: foundProfile.twitter,
              picture: foundProfile.picture,
              coverPicture: foundProfile.coverPicture,
              arweaveTxId: foundProfile.arweaveTxId,
              updatedAt: DateTime.fromDateUnsafe(foundProfile.updatedAt),
            },
      postsCount: totals.count,
    };
  });

export const UsersHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "users",
  (handlers) =>
    handlers.handle("get", ({ params }) => getUserProfile(params.username)),
);
