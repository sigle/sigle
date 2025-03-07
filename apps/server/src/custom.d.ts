import type * as Sentry from "@sentry/node";
import type { PostHog } from "posthog-node";
import type { AuthenticatedUser } from "./middleware/3.auth-user";

declare module "h3" {
  interface H3EventContext {
    $sentry: typeof Sentry;
    $posthog: PostHog;
    user: AuthenticatedUser;
  }
}

declare global {
  interface BigInt {
    toJSON(): string;
  }
}
