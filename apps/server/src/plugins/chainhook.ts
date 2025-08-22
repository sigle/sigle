import { defineNitroPlugin } from "nitropack/runtime";
import { env } from "~/env";
import { manageChainhookStatusJob } from "~/jobs/manage-chainhook-status";
import {
  createChainhook,
  createPredicate,
  getChainhooks,
  predicatePrefix,
  preparePredicate,
} from "~/lib/chainhook";
import { consola } from "~/lib/consola";
import {
  contractDeploymentPredicate,
  sigleMinterFixedPricePredicate,
  sigleProfilesPredicate,
} from "~/lib/predicates";

/**
 * Setup the required chainhook that are necessary for the app to run properly.
 */
export default defineNitroPlugin(async () => {
  if (env.NODE_ENV === "development" && !env.HIRO_API_KEY) {
    consola.warn("HIRO_API_KEY is not set, chainhooks will not be registered");
  }
  if (env.NODE_ENV === "development" && !env.WEBHOOK_PROXY_URL) {
    consola.warn(
      "WEBHOOK_PROXY_URL is not set, chainhooks will not be registered",
    );
    return;
  }
  if (!env.HIRO_API_KEY) {
    return;
  }

  const chainhooks = await getChainhooks();

  // Array of predicates to register
  const predicatesToRegister = [
    contractDeploymentPredicate,
    sigleProfilesPredicate,
    sigleMinterFixedPricePredicate,
  ];

  // Register all chainhooks from the array
  for (const predicate of predicatesToRegister) {
    const predicateName = `${predicatePrefix}.${predicate.name}`;
    const hasChainhook = chainhooks.find(
      (chainhook) => chainhook.name === predicateName,
    );

    if (!hasChainhook) {
      predicate.name = predicateName;
      const response = await createChainhook(
        preparePredicate(createPredicate(predicate)),
      );
      consola.info(
        `Registered ${predicateName} chainhook ${response.chainhookUuid}`,
      );
    }
  }

  // TODO move to cron job
  manageChainhookStatusJob.emit({});

  consola.success(
    `Plugin: ${predicatesToRegister.length} Chainhooks registered`,
  );
});
