import { env } from "@/env";
import * as Sentry from "@sentry/nextjs";
import { verifySiwsMessage } from "@sigle/sign-in-with-stacks";
import NextAuth from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      /** The user's stacks address. */
      address: string;
    };
  }

  interface User {
    /** The user's stacks address. */
    address: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    id: string;
    address: string;
  }
}

const hostname = new URL(env.NEXT_PUBLIC_APP_URL).hostname;
const rootDomain = hostname.split(".").slice(-2).join(".");
const useSecureCookies = env.NEXT_PUBLIC_APP_URL.startsWith("https://");
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        /**
         * We take the default cookies from NextAuth and add our own
         * domain to allow cookies to be shared between subdomains.
         * Eg: https://app.sigle.io needs to be set to .sigle.io
         * Localhost and vercel preview env just use the hostname directly.
         */
        domain:
          hostname == "localhost" || process.env.VERCEL_ENV === "preview"
            ? hostname
            : "." + rootDomain,
      },
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Set user fields during Sign in
        token.id = user.id!;
        token.address = user.address;
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          address: token.address,
        },
      };
    },
  },
  providers: [
    Credentials({
      name: "SignInWithStacks",
      credentials: {
        message: {},
        signature: {},
      },
      authorize: async (credentials) => {
        try {
          const signInSchema = z.object({
            address: z.string().min(1),
            message: z.string().min(1),
            signature: z.string().min(1),
            csrfToken: z.string().min(1),
          });

          const { address, message, signature, csrfToken } =
            signInSchema.parse(credentials);

          const valid = verifySiwsMessage({
            message,
            signature,
            address,
            domain: new URL(env.NEXT_PUBLIC_APP_URL).host,
            nonce: csrfToken,
          });

          if (valid) {
            const data = await fetch(
              `${env.NEXT_PUBLIC_API_URL}/api/internal/login-user-sync`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  authorization: `Bearer ${env.INTERNAL_API_TOKEN}`,
                },
                body: JSON.stringify({
                  address,
                }),
              },
            );
            const json = await data.json();

            const signInResponseSchema = z.object({
              id: z.string().min(1),
            });

            const { id } = signInResponseSchema.parse(json);

            return {
              id,
              address,
            };
          }

          return null;
        } catch (error) {
          Sentry.withScope((scope) => {
            scope.setExtras({
              message: credentials?.message,
              signature: credentials?.signature,
            });
            Sentry.captureException(error);
          });
          return null;
        }
      },
    }),
  ],
});
