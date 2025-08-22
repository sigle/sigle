import {
  getChainhookStatus,
  getChainhooks,
  predicatePrefix,
} from "~/lib/chainhook";
import { consola } from "~/lib/consola";
import { defineJob } from "~/lib/jobs";

export const manageChainhookStatusJob = defineJob("manage-chainhook-status")
  .options({
    priority: 1,
    retryLimit: 2,
    retryDelay: 60000,
  })
  .work(async () => {
    const chainhooks = await getChainhooks();

    for (const chainhook of chainhooks) {
      if (!chainhook.name.startsWith(predicatePrefix)) {
        continue;
      }
      const chainhookStatus = await getChainhookStatus(chainhook.uuid);
      if (chainhookStatus.status === "error") {
        console.error(
          "Chainhook API error",
          chainhook.uuid,
          chainhookStatus.message,
        );
      } else if (chainhookStatus.status.type === "interrupted") {
        console.error(
          "Chainhook interrupted",
          chainhook.uuid,
          chainhookStatus.status.info,
        );
      }
      console.log(chainhookStatus);
    }

    consola.debug("manage-chainhook-status", {
      chainhooks: chainhooks.length,
      // TODO number of API errors
      // TODO number of interrupted chainhooks
      // TODO number of chainhooks that are running
    });
  });
