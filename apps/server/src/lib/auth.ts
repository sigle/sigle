import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { betterAuthSiws } from "./siws-auth";

// TODO see how we set the cookie secret here
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  // TODO take from env
  trustedOrigins: ["http://localhost:3000"],
  user: {
    // TODO move all app tables to lowercase
    modelName: "User",
  },
  plugins: [betterAuthSiws()],
});
