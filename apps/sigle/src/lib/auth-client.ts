import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { siwsClient } from "sign-in-with-stacks/plugins/better-auth/client";
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL,
  plugins: [
    siwsClient(),
    inferAdditionalFields({
      user: {
        address: {
          type: "string",
        },
      },
    }),
  ],
});

export const { signOut } = authClient;
