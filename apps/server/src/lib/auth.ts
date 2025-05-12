import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "~/env";
import { prisma } from "./prisma";
import { betterAuthSiws } from "./siws-auth";

// Only enable secure cookies with https to get localhost to work
const useSecureCookies = env.APP_URL.startsWith("https://");
const hostname = new URL(env.APP_URL).hostname;
const rootDomain = hostname.split(".").slice(-2).join(".");

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.AUTH_SECRET,
  appName: "sigle",
  baseURL: env.APP_URL,
  trustedOrigins: [env.APP_URL],
  advanced: {
    cookiePrefix: "sigle",
    useSecureCookies,
    /**
     * Allow cookies to be shared between subdomains.
     * Eg: https://app.sigle.io needs to be set to .sigle.io
     * Localhost just use the hostname directly.
     */
    crossSubDomainCookies: {
      enabled: true,
      domain: hostname === "localhost" ? hostname : `.${rootDomain}`,
    },
  },
  plugins: [betterAuthSiws()],
});
