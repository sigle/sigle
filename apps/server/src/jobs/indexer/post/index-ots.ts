import { env } from "@/env";
import { consola } from "@/lib/consola";
import { prisma } from "@/lib/prisma";
import { opentimestampsStampJob } from "../../opentimestamps-stamp";

interface ArweaveOtsGraphQLEdge {
  node: {
    id: string;
  };
}

interface ArweaveOtsGraphQLResponse {
  data?: {
    transactions?: {
      edges?: ArweaveOtsGraphQLEdge[];
    };
  };
}

export async function indexOtsForPost({
  postId,
  txId,
}: {
  postId: string;
  txId: string;
}) {
  const existingPostOts = await prisma.postOts.findUnique({
    where: { postTxId: txId },
  });

  if (existingPostOts?.status === "UPGRADED" && existingPostOts.otsTxId) {
    return;
  }

  // Query Arweave GraphQL for OTS transaction tagged with Original-Tx = txId
  const query = `
    query {
      transactions(
        tags: [
          { name: "Content-Type", values: ["application/vnd.opentimestamps.ots"] }
          { name: "Original-Tx", values: ["${txId}"] }
        ]
        first: 1
      ) {
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${env.ARWEAVE_GATEWAY_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const result = (await response.json()) as ArweaveOtsGraphQLResponse;
      const edges = result.data?.transactions?.edges;
      if (edges && edges.length > 0) {
        const otsTxId = edges[0].node.id;
        await prisma.postOts.upsert({
          where: { postTxId: txId },
          update: {
            status: "UPGRADED",
            otsTxId,
            pendingProof: null,
          },
          create: {
            postId,
            postTxId: txId,
            status: "UPGRADED",
            otsTxId,
          },
        });
        consola.info("Reindexed OTS proof from Arweave", {
          postId,
          txId,
          otsTxId,
        });
        return;
      }
    }
  } catch (err) {
    consola.error("Failed to query Arweave for OTS transactions", {
      txId,
      err,
    });
  }

  // If no OTS proof found on Arweave and not already stamped/upgraded, trigger stamp job
  if (!existingPostOts) {
    await opentimestampsStampJob.emit({
      postId,
      txId,
    });
  }
}
