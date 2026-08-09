import { Result, TaggedError } from "better-result";
import { z } from "zod";
import { env } from "@/env";
import { consola } from "@/lib/consola";
import { prisma } from "@/lib/prisma";

export const indexerSyncArweaveL1TxIdsSchema = z.object({
  action: z.literal("indexer-sync-arweave-l1-tx-ids"),
  data: z.object({}),
});

export class FetchArweaveL1TxIdsFailedError extends TaggedError(
  "FetchArweaveL1TxIdsFailedError",
)<{
  error: string;
}>() {}

interface ArweaveL1GraphQLResponse {
  errors?: Array<{ message: string }>;
  data?: {
    transactions?: {
      edges?: Array<{
        node: {
          id: string;
          bundledIn?: {
            id: string;
          } | null;
        };
      }>;
    };
  };
}

export async function fetchArweaveL1TxIds(
  txIds: string[],
): Promise<Result<Record<string, string>, FetchArweaveL1TxIdsFailedError>> {
  if (txIds.length === 0) {
    return Result.ok({});
  }

  const idsJson = JSON.stringify(txIds);
  const query = `
    query {
      transactions(
        ids: ${idsJson}
        first: ${txIds.length}
      ) {
        edges {
          node {
            id
            bundledIn {
              id
            }
          }
        }
      }
    }
  `;

  return Result.tryPromise({
    try: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${env.ARWEAVE_GATEWAY_URL}/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = (await response.json()) as ArweaveL1GraphQLResponse;
        if (result.errors && result.errors.length > 0) {
          throw new Error(
            `GraphQL error: ${result.errors.map((e) => e.message).join(", ")}`,
          );
        }

        const edges = result.data?.transactions?.edges ?? [];
        const mapping: Record<string, string> = {};

        for (const edge of edges) {
          const l1TxId = edge.node.bundledIn?.id;
          if (l1TxId) {
            mapping[edge.node.id] = l1TxId;
          }
        }

        return mapping;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    catch: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return new FetchArweaveL1TxIdsFailedError({ error: errorMessage });
    },
  });
}

export const executeIndexerSyncArweaveL1TxIdsJob = async (
  _data: z.TypeOf<typeof indexerSyncArweaveL1TxIdsSchema>["data"],
) => {
  const postsWithoutL1 = await prisma.post.findMany({
    select: { txId: true },
    where: { arweaveL1TxId: null },
    take: 100,
  });

  const revisionsWithoutL1 = await prisma.postRevision.findMany({
    select: { txId: true },
    where: { arweaveL1TxId: null },
    take: 100,
  });

  const txIdsSet = new Set<string>();
  const maxLen = Math.max(postsWithoutL1.length, revisionsWithoutL1.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < postsWithoutL1.length) {
      txIdsSet.add(postsWithoutL1[i].txId);
      if (txIdsSet.size >= 100) break;
    }
    if (i < revisionsWithoutL1.length) {
      txIdsSet.add(revisionsWithoutL1[i].txId);
      if (txIdsSet.size >= 100) break;
    }
  }

  const txIds = Array.from(txIdsSet);

  if (txIds.length === 0) {
    consola.debug("No posts or revisions missing arweaveL1TxId found");
    return;
  }

  consola.info("Syncing arweaveL1TxId for transaction IDs", {
    count: txIds.length,
  });

  const fetchResult = await fetchArweaveL1TxIds(txIds);
  if (fetchResult.isErr()) {
    consola.error("Failed to fetch L1 tx IDs from Arweave GraphQL", {
      error: fetchResult.error,
    });
    throw new Error(fetchResult.error.error);
  }

  const mapping = fetchResult.value;
  const updatedTxIds = Object.keys(mapping);

  if (updatedTxIds.length === 0) {
    consola.info("No new L1 transaction IDs found on Arweave yet");
    return;
  }

  let updatedPostsCount = 0;
  let updatedRevisionsCount = 0;

  for (const [txId, arweaveL1TxId] of Object.entries(mapping)) {
    const postRes = await prisma.post.updateMany({
      where: { txId, arweaveL1TxId: null },
      data: { arweaveL1TxId },
    });
    updatedPostsCount += postRes.count;

    const revRes = await prisma.postRevision.updateMany({
      where: { txId, arweaveL1TxId: null },
      data: { arweaveL1TxId },
    });
    updatedRevisionsCount += revRes.count;
  }

  consola.info("Finished syncing arweaveL1TxId", {
    checked: txIds.length,
    foundL1TxIds: updatedTxIds.length,
    updatedPosts: updatedPostsCount,
    updatedRevisions: updatedRevisionsCount,
  });
};
