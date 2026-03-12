// Inspired by https://www.lichter.io/articles/nuxt3-sentry-recipe/
import { definePlugin } from "nitro";
import { PostHog } from "posthog-node";
import { env } from "@/env";

const posthog = new PostHog(env.POSTHOG_API_KEY || "dev", {
  host: env.POSTHOG_API_HOST,
});

// if (env.NODE_ENV === "development") {
//   posthog.debug(true);
// }

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    // @ts-expect-error - context is not properly typed in hooks
    event.context.$posthog = posthog;
  });

  nitroApp.hooks.hook("close", async () => {
    await posthog.shutdown();
  });
});
