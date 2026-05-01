import { cvToJSON, hexToCV } from "@stacks/transactions";
import { z } from "zod";
import { consola } from "@/lib/consola";
import { prisma } from "@/lib/prisma";
import { sigleConfig } from "@/lib/sigle";
import { getStacksTransaction, stacksApiClient } from "@/lib/stacks";
import { indexerJob } from "..";

export const indexerIndexPostsSchema = z.object({
  action: z.literal("indexer-index-posts"),
  data: z.object({}),
});

const API_LIMIT = 50;

const eventLogSchema = z.object({
  value: z.object({
    a: z.object({
      value: z.literal("publish-post"),
    }),
    author: z.object({
      value: z.string(),
    }),
    uri: z.object({
      value: z.string(),
    }),
  }),
});

export const executeIndexerIndexPostsJob = async (
  _data: z.TypeOf<typeof indexerIndexPostsSchema>["data"],
) => {
  const latestPost = await prisma.post.findFirst({
    select: {
      id: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const lastProcessedId = latestPost?.id;

  let offset = 0;
  let hasMore = true;
  let caughtUp = false;
  const posts: {
    txId: string;
    blockHeight: number;
    author: string;
    uri: string;
    createdAt: Date;
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
            contract_id: sigleConfig.registryAddress,
          },
          query: {
            limit: API_LIMIT,
            offset,
          },
        },
      },
    );

    if (resultEvents.error) {
      // TODO handle error (retry with backoff, alert, etc.)
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
      if (lastProcessedId && event.tx_id === lastProcessedId) {
        consola.info("Caught up to last processed txId, stopping", {
          txId: lastProcessedId,
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
        const txTimestamp = new Date(transaction.value.burn_block_time * 1000);
        const txBlockHeight = transaction.value.block_height;

        posts.push({
          txId: event.tx_id,
          blockHeight: txBlockHeight,
          author: eventLog.data.value.author.value,
          uri: eventLog.data.value.uri.value,
          createdAt: txTimestamp,
        });
      }
    }

    offset += API_LIMIT;
  }

  if (posts.length > 0) {
    // Process oldest posts first
    posts.reverse();
    for (const post of posts) {
      await indexerJob.emit({
        action: "indexer-publish-post",
        data: post,
      });
    }
  }

  const returnData = {
    toProcess: posts.length,
    lastProcessedId,
  };
  consola.info("Index posts job complete", returnData);
  return returnData;
};
