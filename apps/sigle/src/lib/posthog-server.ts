import { PostHog } from "posthog-node";
import { env } from "@/env";

let client: PostHog | undefined = undefined;

/**
 * The PostHog client of the Next.js server, created once per process: it
 * sends events in batches. Undefined without `NEXT_PUBLIC_POSTHOG_KEY`.
 */
export const getPostHogServer = (): PostHog | undefined => {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) {
    return undefined;
  }

  client ??= new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
  });

  return client;
};
