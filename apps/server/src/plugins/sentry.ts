// Inspired by https://www.lichter.io/articles/nuxt3-sentry-recipe/
import * as Sentry from "@sentry/node";
import { definePlugin } from "nitro";
import { HTTPError } from "nitro/h3";
import { env } from "@/env";

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
    // Sentry v11 collects cookies, user IPs, request/response bodies, and
    // database queries by default. Keep the v10 defaults so session cookies and
    // request payloads stay out of Sentry.
    // https://github.com/getsentry/sentry-javascript/blob/develop/MIGRATION.md#if-you-want-to-keep-the-v10-default-behavior
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: {
        request: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
        response: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
      },
      httpBodies: [],
      urlQueryParams: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      graphQL: { document: false, variables: false },
    },
  });

  nitroApp.hooks.hook("request", (event) => {
    // @ts-expect-error - context is not properly typed in hooks
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
