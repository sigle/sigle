import { validateStacksAddress } from "@stacks/transactions";
import { eq } from "drizzle-orm";
import { DateTime, Effect } from "effect";
import { HttpApiBuilder, HttpApiSchema } from "effect/http-api";
import { SigleApi } from "@/api";
import { BadRequest, NotFound } from "@/api/schemas";
import { Database } from "@/db";
import { profile, user, walletAddress } from "@/db/schema";

const CACHE_CONTROL = "public, max-age=60";

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

    const foundProfile = foundUser.profile;
    const etag = foundProfile ? `"${foundProfile.arweaveTxId}"` : `"none"`;

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
                picture: foundProfile.picture,
                coverPicture: foundProfile.coverPicture,
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
