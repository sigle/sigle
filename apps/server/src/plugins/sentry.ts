// Inspired by https://www.lichter.io/articles/nuxt3-sentry-recipe/
import * as Sentry from "@sentry/node";
import { definePlugin } from "nitro";
import { HTTPError } from "nitro/h3";
import { env } from "~/env";

const ignoreErrors = [
  401, // Unauthorized
  404, // Not Found
  422, // Unprocessable Entity
];

// oxlint-disable-next-line no-extend-native
BigInt.prototype.toJSON = function toJSON() {
  return this.toString();
};

export default definePlugin((nitroApp) => {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SIGLE_ENV,
  });

  nitroApp.hooks.hook("request", (event) => {
    event.context.$sentry = Sentry;
  });

  nitroApp.hooks.hook("error", (error) => {
    // Do not report 401s, 404s and 422s
    if (HTTPError.isError(error) && ignoreErrors.includes(error.status)) {
      return;
    }

    Sentry.captureException(error);
  });

  // closing Sentry on shutdown
  nitroApp.hooks.hook("close", async () => {
    await Sentry.close(2000);
  });
});
