// Inspired by https://www.lichter.io/articles/nuxt3-sentry-recipe/
import { definePlugin } from "nitro";
import { PostHog } from "posthog-node";
import { env } from "@/env";

const posthog = new PostHog(env.POSTHOG_API_KEY || "dev", {
  host: env.POSTHOG_API_HOST,
});

if (import.meta.test) {
  posthog.shutdown();
}

export default definePlugin((nitroApp) => {
  if (import.meta.test) return;
  nitroApp.hooks.hook("request", (event) => {
    // @ts-expect-error - context is not properly typed in hooks
    event.context.$posthog = posthog;
  });

  nitroApp.hooks.hook("close", async () => {
    await posthog.shutdown();
  });
});
