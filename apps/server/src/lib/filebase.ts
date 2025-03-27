import * as Signer from "@ucanto/principal/ed25519";
import { create } from "@web3-storage/w3up-client";
import * as Proof from "@web3-storage/w3up-client/proof";
import type { H3Event } from "h3";
import { env } from "~/env";
import { consola } from "./consola";

const principal = Signer.parse(env.W3UP_AGENT_KEY);
const w3upClient = await create({ principal });
const proof = await Proof.parse(env.W3UP_AGENT_PROOF);
const space = await w3upClient.addSpace(proof);
await w3upClient.setCurrentSpace(space.did());

export const ipfsUploadFile = async (
  event: H3Event,
  {
    path,
    content,
  }: {
    path: string;
    content: Buffer;
  },
) => {
  try {
    const response = await w3upClient.uploadFile(new Blob([content]), {});
    const cid = response.toString();

    if (!cid) {
      throw createError({
        status: 500,
        message: "Failed to upload to IPFS, no cid found",
      });
    }

    return { cid };
  } catch (error) {
    consola.error(error);
    const sentryId = event.context.$sentry.captureException(error, {
      extra: {
        path,
      },
    });
    throw createError({
      status: 500,
      message: `Failed to upload to IPFS, error: ${sentryId}`,
    });
  }
};
