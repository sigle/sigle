import { UpgradeError } from "@otskit/client";
import { z } from "zod";
import { arweaveUploadFile } from "@/lib/arweave";
import { consola } from "@/lib/consola";
import { defineJob } from "@/lib/jobs";
import { openTimestampsClient } from "@/lib/opentimestamps";
import { prisma } from "@/lib/prisma";

export const opentimestampsUpgradeJob = defineJob("opentimestamps-upgrade")
  .input(
    z.object({
      postId: z.string(),
      txId: z.string(),
    }),
  )
  .options({
    priority: 2,
    retryLimit: 96, // Retries over 48 hours
    retryDelay: 1800000, // 30 minutes interval
  })
  .work(async ([job]) => {
    const { txId } = job.data;

    const postOts = await prisma.postOts.findUnique({
      where: {
        postTxId: txId,
      },
    });

    if (!postOts || postOts.status === "UPGRADED") {
      consola.debug("PostOts already upgraded or missing", { txId });
      return;
    }

    if (!postOts.pendingProof) {
      throw new Error(`Missing pending proof for txId ${txId}`);
    }
    const pendingProof = Buffer.from(postOts.pendingProof);

    const upgradePendingProof = async (): Promise<Buffer> => {
      try {
        return await openTimestampsClient.upgrade(pendingProof);
      } catch (error) {
        await prisma.postOts.update({
          where: { postTxId: txId },
          data: {
            attempts: { increment: 1 },
            lastAttempt: new Date(),
          },
        });
        if (error instanceof UpgradeError) {
          consola.debug(
            "OTS proof not yet anchored in Bitcoin block, will retry",
            {
              txId,
              attempts: postOts.attempts + 1,
            },
          );
          throw new Error("OTS proof not yet anchored in Bitcoin block", {
            cause: error,
          });
        }
        throw error;
      }
    };

    const proof = await upgradePendingProof();

    // Proof upgraded! Upload .ots file to Arweave
    const tags = [
      { name: "Original-Tx", value: txId },
      { name: "Root-TX", value: txId },
      { name: "Type", value: "opentimestamps" },
    ];

    const arweaveResult = await arweaveUploadFile({
      file: proof,
      contentType: "application/vnd.opentimestamps.ots",
      tags,
    });

    if (arweaveResult.isErr()) {
      consola.error("Failed to upload upgraded OTS proof to Arweave", {
        txId,
        error: arweaveResult.error,
      });
      throw arweaveResult.error;
    }

    const otsTxId = arweaveResult.value.id;

    await prisma.postOts.update({
      where: { postTxId: txId },
      data: {
        status: "UPGRADED",
        otsTxId,
        pendingProof: null,
        lastAttempt: new Date(),
      },
    });

    consola.info("Successfully upgraded and uploaded OTS proof to Arweave", {
      txId,
      otsTxId,
    });
  });
