import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "~/env";
import { prisma } from "./prisma";
import { betterAuthSiws } from "./siws-auth";

// Only enable secure cookies with https to get localhost to work
const useSecureCookies = env.APP_URL.startsWith("https://");

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: [env.APP_URL],
  user: {
    // TODO move all app tables to lowercase
    modelName: "User",
  },
  advanced: {
    cookiePrefix: "sigle",
    // TODO see how we set the cookie secret here
    useSecureCookies,
  },
  session: {},
  plugins: [betterAuthSiws()],
});
