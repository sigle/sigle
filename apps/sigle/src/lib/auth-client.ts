import { env } from "@/env";
import type { BetterAuthClientPlugin } from "better-auth";
import { createAuthClient } from "better-auth/react";
import type { betterAuthSiws } from "./better-auth";

const siwsClientPlugin = () => {
  return {
    id: "sign-in-with-stacks",
    $InferServerPlugin: {} as ReturnType<typeof betterAuthSiws>,
  } satisfies BetterAuthClientPlugin;
};

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL,
  plugins: [siwsClientPlugin()],
});

export const { signOut, useSession } = authClient;
