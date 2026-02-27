import { cvToJSON, hexToCV } from "@stacks/transactions";
import { z } from "zod";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";
import { sigleConfig } from "~/lib/sigle";
import { stacksApiClient } from "~/lib/stacks";
import { indexerJob } from ".";

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

async function getTxTimestamp(txId: string): Promise<Date> {
  const txResult = await stacksApiClient.GET("/extended/v1/tx/{tx_id}", {
    params: {
      path: {
        tx_id: txId,
      },
      // Used for faster queries
      query: {
        event_limit: 0,
        exclude_function_args: true,
      },
    },
  });

  if (txResult.error || !txResult.data) {
    throw new Error(`Failed to fetch tx ${txId}: ${txResult.error}`);
  }
  if (txResult.data.tx_status !== "success") {
    throw new Error(
      `Transaction ${txId} is not successful: status ${txResult.data.tx_status}`,
    );
  }

  return new Date(txResult.data.burn_block_time * 1000);
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
  let caughtUp = false;
  const posts: {
    txId: string;
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
          break;
        }

        posts.push({
          txId: event.tx_id,
          author: eventLog.data.value.author.value,
          uri: eventLog.data.value.uri.value,
          createdAt: await getTxTimestamp(event.tx_id),
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
    lastProcessedTxId,
  };
  consola.info("Index posts job complete", returnData);
  return returnData;
};
