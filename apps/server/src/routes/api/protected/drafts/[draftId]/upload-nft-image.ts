import { env } from "~/env";
import { ipfsUploadFile } from "~/lib/ipfs-upload";
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
              required: ["cid", "url"],
              properties: {
                cid: { type: "string" },
                url: { type: "string" },
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
  };
});
