import { create } from "@storacha/client";
import * as Proof from "@storacha/client/proof";
import * as Signer from "@ucanto/principal/ed25519";
import { createError, type H3Event } from "h3";
import { env } from "~/env";
import { consola } from "./consola";

const principal = Signer.parse(env.STORACHA_AGENT_KEY);
const storachaClient = await create({ principal });
const proof = await Proof.parse(env.STORACHA_AGENT_PROOF);
const space = await storachaClient.addSpace(proof);
await storachaClient.setCurrentSpace(space.did());

export const ipfsUploadFile = async (
  event: H3Event,
  {
    content,
  }: {
    content: Buffer;
  },
) => {
  try {
    const response = await storachaClient.uploadFile(new Blob([content]));
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
    const sentryId = event.context.$sentry.captureException(error);
    throw createError({
      status: 500,
      message: `Failed to upload to IPFS, error: ${sentryId}`,
    });
  }
};
