import { asc, desc, eq } from "drizzle-orm";
import { Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { SigleApi } from "@/api";
import { CurrentUser } from "@/api/middleware/auth-user";
import { Database } from "@/db";
import { walletAddress } from "@/db/schema";

export const getMe = Effect.gen(function* () {
  const user = yield* CurrentUser;
  const db = yield* Database;

  const [wallet] = yield* db
    .select({ address: walletAddress.address })
    .from(walletAddress)
    .where(eq(walletAddress.userId, user.id))
    .orderBy(desc(walletAddress.isPrimary), asc(walletAddress.createdAt))
    .limit(1)
    .pipe(Effect.orDie);

  return {
    id: user.id,
    address: wallet?.address ?? null,
    whitelisted: user.whitelisted,
  };
});

export const ProtectedHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "protected",
  (handlers) => handlers.handle("me", () => getMe),
);
