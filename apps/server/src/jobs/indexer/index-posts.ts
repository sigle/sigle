import { z } from "zod";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";
import { sigleConfig } from "~/lib/sigle";
import { stacksApiClient } from "~/lib/stacks";

export const indexerIndexPostsSchema = z.object({
  action: z.literal("indexer-index-posts"),
  data: z.object({}),
});

const CONTRACT_ID = `${sigleConfig.protocolAddress}.responsible-aqua-scallop`;
const API_LIMIT = 50;

interface ContractEvent {
  event_index: number;
  event_type: string;
  tx_id: string;
  contract_log?: {
    contract_id: string;
    topic: string;
    value: {
      hex: string;
      repr: string;
    };
  };
}

interface ContractEventsResponse {
  results: ContractEvent[];
}

export const executeIndexerIndexPostsJob = async (
  _data: z.TypeOf<typeof indexerIndexPostsSchema>["data"],
) => {
  const latestPost = await prisma.post.findFirst({
    select: {
      txId: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const lastProcessedTxId = latestPost?.txId;

  let offset = 0;
  let hasMore = true;
  let processedCount = 0;
  let caughtUp = false;

  while (hasMore && !caughtUp) {
    const resultEvents = (await stacksApiClient.GET(
      "/extended/v1/contract/{contract_id}/events",
      {
        params: {
          path: {
            contract_id: CONTRACT_ID,
          },
          query: {
            limit: API_LIMIT,
            offset,
          },
        },
      },
    )) as { data: ContractEventsResponse };

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
        const valueRepr = event.contract_log.value.repr;

        if (valueRepr.includes("publish-post")) {
          const uriMatch = valueRepr.match(/uri "([^"]+)"/);
          const authorMatch = valueRepr.match(/author (SP[0-9A-Z]+)/);

          if (uriMatch && authorMatch) {
            const existingPost = await prisma.post.findUnique({
              where: {
                txId: event.tx_id,
              },
            });

            if (!existingPost) {
              processedCount++;
              consola.info("Found new publish-post event", {
                txId: event.tx_id,
                author: authorMatch[1],
                uri: uriMatch[1],
              });
            }
          } else {
            consola.warn("Failed to parse publish-post event", {
              txId: event.tx_id,
              repr: valueRepr,
            });
          }
        }
      }
    }

    offset += API_LIMIT;
  }

  consola.info("Index posts job complete", {
    processed: processedCount,
    lastProcessedTxId,
  });

  return { processed: processedCount, caughtUp };
};
