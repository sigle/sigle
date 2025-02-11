// Inspired by https://www.lichter.io/articles/nuxt3-sentry-recipe/
import * as Sentry from "@sentry/node";
import { H3Error } from "h3";
import { env } from "~/env";

const ignoreErrors = [
  401, // Unauthorized
  404, // Not Found
  422, // Unprocessable Entity
];

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default defineNitroPlugin((nitroApp) => {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SIGLE_ENV,
  });

  nitroApp.hooks.hook("request", (event) => {
    event.context.$sentry = Sentry;
  });

  nitroApp.hooks.hook("error", (error) => {
    // Do not report 401s, 404s and 422s
    if (error instanceof H3Error && ignoreErrors.includes(error.statusCode)) {
      return;
    }

    Sentry.captureException(error);
  });

  // closing Sentry on shutdown
  nitroApp.hooks.hookOnce("close", async () => {
    await Sentry.close(2000);
  });
});
