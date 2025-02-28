// Inspired by https://www.lichter.io/articles/nuxt3-sentry-recipe/
import { PostHog } from "posthog-node";
import { env } from "~/env";

const posthog = new PostHog(env.POSTHOG_API_KEY || "dev", {
  host: env.POSTHOG_API_HOST,
});

// if (env.NODE_ENV === "development") {
//   posthog.debug(true);
// }

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    event.context.$posthog = posthog;
  });

  nitroApp.hooks.hookOnce("close", async () => {
    await posthog.shutdown();
  });
});
