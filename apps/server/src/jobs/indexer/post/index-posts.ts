import { z } from "zod";
import { env } from "@/env";
import { consola } from "@/lib/consola";
import { getMetadataFromUri } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { indexerJob } from "..";

export const indexerIndexPostsSchema = z.object({
  action: z.literal("indexer-index-posts"),
  data: z.object({}),
});

interface GraphQLResponse {
  data?: {
    transactions?: {
      edges?: Array<{
        node: {
          id: string;
          block?: {
            height: number;
            timestamp: number;
          } | null;
        };
      }>;
    };
  };
}

export const executeIndexerIndexPostsJob = async (
  _data: z.TypeOf<typeof indexerIndexPostsSchema>["data"],
) => {
  const latestMinedPost = await prisma.post.findFirst({
    select: {
      blockHeight: true,
    },
    where: {
      blockHeight: {
        gt: 0,
      },
    },
    orderBy: {
      blockHeight: "desc",
    },
  });

  const minBlockHeight = latestMinedPost ? latestMinedPost.blockHeight : 0;
  consola.info("Starting indexer run from block height", { minBlockHeight });

  let toProcess = 0;
  let currentMinBlockHeight = minBlockHeight;
  let hasMore = true;

  while (hasMore) {
    consola.info("Fetching events from Arweave GraphQL", {
      currentMinBlockHeight,
    });

    const query = `
      query {
        transactions(
          tags: [
            { name: "App-Name", values: ["${env.APP_ID}"] }
          ]
          block: { min: ${currentMinBlockHeight} }
          first: 100
          sort: HEIGHT_ASC
        ) {
          edges {
            node {
              id
              block {
                height
                timestamp
              }
            }
          }
        }
      }
    `;

    let edges: Array<{
      node: {
        id: string;
        block?: {
          height: number;
          timestamp: number;
        } | null;
      };
    }> = [];
    try {
      const response = await fetch(`${env.ARWEAVE_GATEWAY_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = (await response.json()) as GraphQLResponse;
      edges = result.data?.transactions?.edges || [];
    } catch (error) {
      consola.error("Error fetching transactions from Arweave GraphQL", {
        error,
      });
      break;
    }

    if (edges.length === 0) {
      hasMore = false;
      break;
    }

    if (edges.length < 100) {
      hasMore = false;
    }

    for (const edge of edges) {
      const txId = edge.node.id;

      // Check if post already exists in database
      const postExists = await prisma.post.findUnique({
        select: {
          id: true,
        },
        where: {
          txId,
        },
      });

      if (postExists) {
        // oxlint-disable-next-line no-continue
        continue;
      }

      const uri = `ar://${txId}`;
      const metadataResult = await getMetadataFromUri(uri);
      if (metadataResult.isErr()) {
        consola.error("Failed to fetch/validate metadata for transaction", {
          txId,
          error: metadataResult.error,
        });
        // oxlint-disable-next-line no-continue
        continue;
      }

      const metadata = metadataResult.value;
      const blockHeight = edge.node.block ? edge.node.block.height : 0;
      const createdAt = edge.node.block
        ? new Date(edge.node.block.timestamp * 1000)
        : new Date();

      await indexerJob.emit({
        action: "indexer-publish-post",
        data: {
          txId,
          blockHeight,
          author: metadata.recoveredAddress,
          uri,
          createdAt,
        },
      });

      toProcess++;
    }

    if (hasMore) {
      const minedEdges = edges.filter((e) => e.node.block);
      if (minedEdges.length > 0) {
        const maxBlockHeight = Math.max(
          ...minedEdges.map((e) => e.node.block!.height),
        );
        currentMinBlockHeight = maxBlockHeight + 1;
      } else {
        hasMore = false;
      }
    }
  }

  const returnData = {
    toProcess,
  };
  consola.info("Index posts job complete", returnData);
  return returnData;
};
