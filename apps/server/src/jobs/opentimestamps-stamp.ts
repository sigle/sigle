import { z } from "zod";
import { env } from "@/env";
import { consola } from "@/lib/consola";
import { defineJob } from "@/lib/jobs";
import { stampWithFallback } from "@/lib/opentimestamps";
import { prisma } from "@/lib/prisma";
import { opentimestampsUpgradeJob } from "./opentimestamps-upgrade";

export const opentimestampsStampJob = defineJob("opentimestamps-stamp")
  .input(
    z.object({
      postId: z.string(),
      txId: z.string(),
    }),
  )
  .options({
    priority: 1,
    retryLimit: 3,
    retryDelay: 60000,
  })
  .work(async ([job]) => {
    const { postId, txId } = job.data;

    const response = await fetch(`${env.ARWEAVE_GATEWAY_URL}/${txId}`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch content from Arweave gateway for txId ${txId}: ${response.statusText}`,
      );
    }
    const contentBuffer = Buffer.from(await response.arrayBuffer());

    const stampResult = await stampWithFallback(contentBuffer);
    if (stampResult.isErr()) {
      consola.error("Failed to stamp post metadata with OpenTimestamps", {
        postId,
        txId,
        error: stampResult.error,
      });
      throw stampResult.error;
    }

    const pendingProof = new Uint8Array(stampResult.value);

    await prisma.postOts.upsert({
      where: {
        postTxId: txId,
      },
      update: {
        status: "PENDING",
        pendingProof,
        attempts: 0,
        lastAttempt: new Date(),
      },
      create: {
        postId,
        postTxId: txId,
        status: "PENDING",
        pendingProof,
        attempts: 0,
        lastAttempt: new Date(),
      },
    });

    consola.info("Post stamped with OpenTimestamps, scheduling upgrade job", {
      postId,
      txId,
    });

    await opentimestampsUpgradeJob.emit({
      postId,
      txId,
    });
  });
