import { cvToJSON, hexToCV } from "@stacks/transactions";
import { z } from "zod";
import { consola } from "@/lib/consola";
import { prisma } from "@/lib/prisma";
import { sigleConfig } from "@/lib/sigle";
import { getStacksTransaction, stacksApiClient } from "@/lib/stacks";
import { indexerJob } from "..";

export const indexerIndexProfilesSchema = z.object({
  action: z.literal("indexer-index-profiles"),
  data: z.object({}),
});

const API_LIMIT = 50;

const eventLogSchema = z.object({
  value: z.object({
    a: z.object({
      value: z.literal("set-profile"),
    }),
    address: z.object({
      value: z.string(),
    }),
    uri: z.object({
      value: z.string(),
    }),
  }),
});

export const executeIndexerIndexProfilesJob = async (
  _data: z.TypeOf<typeof indexerIndexProfilesSchema>["data"],
) => {
  // Use updatedAt instead of createdAt because profiles are updated over time
  // and createdAt doesn't change on update. This ensures we start from
  // the most recently indexed profile update.
  const latestProfile = await prisma.profile.findFirst({
    select: {
      txId: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const lastProcessedTxId = latestProfile?.txId;

  let offset = 0;
  let hasMore = true;
  let caughtUp = false;
  const profiles: {
    txId: string;
    address: string;
    uri: string;
  }[] = [];

  while (hasMore && !caughtUp) {
    console.debug("Fetching events from Stacks API", {
      offset,
      limit: API_LIMIT,
    });
    const resultEvents = await stacksApiClient.GET(
      "/extended/v1/contract/{contract_id}/events",
      {
        params: {
          path: {
            contract_id: sigleConfig.profilesRegistryAddress,
          },
          query: {
            limit: API_LIMIT,
            offset,
          },
        },
      },
    );

    if (resultEvents.error) {
      consola.error("Error fetching events from Stacks API", {
        error: resultEvents.error,
      });
      break;
    }

    const events = resultEvents.data.results;

    if (!events || events.length === 0) {
      hasMore = false;
      break;
    }

    if (events.length < API_LIMIT) {
      hasMore = false;
    }

    for (const event of events) {
      if (lastProcessedTxId && event.tx_id === lastProcessedTxId) {
        consola.info("Caught up to last processed txId, stopping", {
          txId: lastProcessedTxId,
        });
        caughtUp = true;
        break;
      }

      if (
        event.event_type === "smart_contract_log" &&
        event.contract_log &&
        event.contract_log.topic === "print"
      ) {
        const eventValue = cvToJSON(hexToCV(event.contract_log.value.hex));
        const eventLog = eventLogSchema.safeParse(eventValue);
        if (!eventLog.success) {
          consola.error("Failed to parse event log with schema", {
            txId: event.tx_id,
            error: eventLog.error,
            value: eventValue,
          });
          // oxlint-disable-next-line no-continue
          continue;
        }

        const transaction = await getStacksTransaction(event.tx_id);
        if (transaction.isErr()) {
          consola.error("Failed to fetch transaction for event log", {
            txId: event.tx_id,
            error: transaction.error,
          });
          // oxlint-disable-next-line no-continue
          continue;
        }
        if (transaction.value.tx_status !== "success") {
          consola.error("Transaction for event log is not successful", {
            txId: event.tx_id,
            status: transaction.value.tx_status,
          });
          // oxlint-disable-next-line no-continue
          continue;
        }

        profiles.push({
          txId: event.tx_id,
          address: eventLog.data.value.address.value,
          uri: eventLog.data.value.uri.value,
        });
      }
    }

    offset += API_LIMIT;
  }

  if (profiles.length > 0) {
    profiles.reverse();
    for (const profile of profiles) {
      await indexerJob.emit({
        action: "indexer-set-profile",
        data: profile,
      });
    }
  }

  const returnData = {
    toProcess: profiles.length,
    lastProcessedTxId,
  };
  consola.info("Index profiles job complete", returnData);
  return returnData;
};
