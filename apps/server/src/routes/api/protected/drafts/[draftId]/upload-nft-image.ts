import { z } from "zod";
import { env } from "~/env";
import { generateCID } from "~/lib/arweave";
import { ipfsUploadFile } from "~/lib/filebase";
import { mimeTypeToExtension } from "~/lib/images";
import { prisma } from "~/lib/prisma";

defineRouteMeta({
  openAPI: {
    tags: ["drafts"],
    description: "Upload nft image to IPFS.",
    responses: {
      200: {
        description: "Media uploaded",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["cid", "url", "gatewayUrl"],
              properties: {
                cid: { type: "string" },
                url: { type: "string" },
                gatewayUrl: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const draftId = getRouterParam(event, "draftId");

  const draft = await prisma.draft.findUnique({
    select: {
      id: true,
    },
    where: {
      id: draftId,
      userId: event.context.user.id,
    },
  });

  if (!draft) {
    throw createError({
      status: 404,
      message: "Draft not found.",
    });
  }

  const response = await fetch(`${env.APP_URL}/api/post/nft-image`);
  const data = await response.blob();
  const optimizedBuffer = Buffer.from(await data.arrayBuffer());

  const { cid } = await ipfsUploadFile(event, {
    path: `${event.context.user.id}/post-${draftId}/nft-image.png`,
    content: optimizedBuffer,
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: "nft image uploaded",
    properties: {
      draftId,
      cid,
    },
  });

  return {
    cid,
    url: `ipfs://${cid}`,
    gatewayUrl: `${env.IPFS_GATEWAY_URL}/ipfs/${cid}`,
  };
});
