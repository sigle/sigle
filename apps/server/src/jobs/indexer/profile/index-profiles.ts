import { ArweaveTags, ArweaveTransactionTypes } from "@sigle/sdk";
import { Result, TaggedError } from "better-result";
import { z } from "zod";
import { env } from "@/env";
import { consola } from "@/lib/consola";
import { prisma } from "@/lib/prisma";
import { indexerJob } from "..";

export const indexerIndexProfilesSchema = z.object({
  action: z.literal("indexer-index-profiles"),
  data: z.object({}),
});

export class FetchArweaveTransactionsFailedError extends TaggedError(
  "FetchArweaveTransactionsFailedError",
)<{
  error: string;
}> {}

export interface ArweaveProfileEdge {
  cursor: string;
  node: {
    id: string;
    block?: {
      height: number;
    } | null;
  };
}

const arweaveProfileEdgeSchema = z.object({
  cursor: z.string(),
  node: z.object({
    id: z.string(),
    block: z.object({ height: z.number() }).nullish(),
  }),
});

const graphQLResponseSchema = z.object({
  errors: z.array(z.object({ message: z.string() })).optional(),
  data: z
    .object({
      transactions: z
        .object({
          edges: z.array(arweaveProfileEdgeSchema),
        })
        .optional(),
    })
    .optional(),
});

export async function fetchArweaveProfileTransactions({
  minBlockHeight,
  afterCursor,
}: {
  minBlockHeight: number;
  afterCursor?: string;
}): Promise<Result<ArweaveProfileEdge[], FetchArweaveTransactionsFailedError>> {
  const afterParam = afterCursor ? `, after: "${afterCursor}"` : "";

  const query = `
    query {
      transactions(
        tags: [
          { name: "${ArweaveTags.appName}", values: ["${env.APP_ID}"] }
          { name: "${ArweaveTags.type}", values: ["${ArweaveTransactionTypes.profile}"] }
        ]
        block: { min: ${minBlockHeight} }
        first: 100
        sort: HEIGHT_ASC
        ${afterParam}
      ) {
        edges {
          cursor
          node {
            id
            block {
              height
            }
          }
        }
      }
    }
  `;

  return Result.tryPromise({
    try: async () => {
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

      const result = graphQLResponseSchema.parse(await response.json());

      if (result.errors && result.errors.length > 0) {
        throw new Error(
          `GraphQL error: ${result.errors.map((e) => e.message).join(", ")}`,
        );
      }

      if (!result.data?.transactions?.edges) {
        throw new Error(
          "Invalid GraphQL response: transactions.edges is missing",
        );
      }

      return result.data.transactions.edges;
    },
    catch: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return new FetchArweaveTransactionsFailedError({ error: errorMessage });
    },
  });
}

export const executeIndexerIndexProfilesJob = async (
  _data: z.TypeOf<typeof indexerIndexProfilesSchema>["data"],
) => {
  const latestMinedProfile = await prisma.profile.findFirst({
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

  const minBlockHeight = latestMinedProfile
    ? latestMinedProfile.blockHeight
    : 0;

  consola.info("Starting profiles indexer run from block height", {
    minBlockHeight,
  });

  let toProcess = 0;
  let currentCursor = "";
  let hasMore = true;

  while (hasMore) {
    consola.info("Fetching profile transactions from Arweave GraphQL", {
      minBlockHeight,
      currentCursor,
    });

    const fetchResult = await fetchArweaveProfileTransactions({
      minBlockHeight,
      afterCursor: currentCursor,
    });

    if (fetchResult.isErr()) {
      consola.error("Error fetching transactions from Arweave GraphQL", {
        error: fetchResult.error,
      });
      throw new Error(fetchResult.error.error);
    }

    const edges = fetchResult.value;

    if (edges.length === 0) {
      hasMore = false;
      break;
    }

    if (edges.length < 100) {
      hasMore = false;
    } else {
      currentCursor = edges[edges.length - 1].cursor;
    }

    for (const edge of edges) {
      const txId = edge.node.id;

      const profileExists = await prisma.profile.findUnique({
        select: {
          id: true,
        },
        where: {
          txId,
        },
      });

      if (profileExists) {
        // oxlint-disable-next-line no-continue
        continue;
      }

      const blockHeight = edge.node.block ? edge.node.block.height : 0;

      await indexerJob.emit({
        action: "indexer-set-profile",
        data: {
          txId,
          uri: `ar://${txId}`,
          blockHeight,
        },
      });

      toProcess++;
    }
  }

  const returnData = {
    toProcess,
  };

  consola.info("Index profiles job complete", returnData);

  return returnData;
};
