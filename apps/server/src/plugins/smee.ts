import SmeeClient from "smee-client";
import { env } from "~/env";
import { consola } from "~/lib/consola";

/**
 * Smee is a proxy server that allows you to receive webhooks locally.
 * This plugin starts smee when the app starts.
 * It's a development only plugin.
 */
export default defineNitroPlugin(async (nitroApp) => {
  if (env.NODE_ENV !== "development") {
    return;
  }
  if (!env.WEBHOOK_PROXY_URL) {
    consola.warn("WEBHOOK_PROXY_URL is not set, smee will not be started");
    return;
  }

  // https://github.com/probot/smee.io/issues/98
  const smee = new SmeeClient({
    source: env.WEBHOOK_PROXY_URL,
    target: `${env.API_URL}/api/chainhook/webhook`,
    logger: consola,
  });

  const events = smee.start();

  nitroApp.hooks.hookOnce("close", async () => {
    // Stop forwarding events
    events.close();
  });
});
