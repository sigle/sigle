import { Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { SigleApi } from "@/api";
import { CurrentUser } from "@/api/middleware/auth-user";
import { findPrimaryWalletAddress } from "@/services/users";

export const getMe = Effect.gen(function* () {
  const user = yield* CurrentUser;

  return {
    id: user.id,
    address: yield* findPrimaryWalletAddress(user.id),
    whitelisted: user.whitelisted,
  };
});

export const ProtectedHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "protected",
  (handlers) => handlers.handle("me", () => getMe),
);
