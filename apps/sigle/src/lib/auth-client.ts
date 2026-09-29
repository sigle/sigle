import type { BetterAuthClientPlugin } from "better-auth";
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";
import type { betterAuthSiws } from "./better-auth";

const siwsClientPlugin = () => {
  // SAFETY: better-auth reads `$InferServerPlugin` only at the type level to
  // infer the server plugin's endpoints; the placeholder value is never
  // accessed at runtime.
  return {
    id: "sign-in-with-stacks",
    $InferServerPlugin: {} as ReturnType<typeof betterAuthSiws>,
  } satisfies BetterAuthClientPlugin;
};

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL,
  plugins: [siwsClientPlugin()],
});

export const { signOut } = authClient;
