import { z } from "zod";
import { allowedFormats, optimizeImage } from "~/lib/images";
import { ipfsUploadFile } from "~/lib/ipfs-upload";
import { readMultipartFormDataSafe } from "~/lib/nitro";
import { prisma } from "~/lib/prisma";

defineRouteMeta({
  openAPI: {
    tags: ["drafts"],
    description: "Upload nft image to IPFS.",
    requestBody: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              file: {
                type: "string",
                format: "binary",
                description: "Profile media",
              },
            },
            required: ["file"],
          },
        },
      },
    },
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

const fileSchema = z.object({
  name: z.string(),
  filename: z.string(),
  type: z.enum(allowedFormats),
});

export default defineEventHandler(async (event) => {
  const draftId = getRouterParam(event, "draftId");
  const formData = await readMultipartFormDataSafe(event, "5mb");

  const file = formData?.find((f) => f.name === "file");
  if (!file) {
    throw createError({
      status: 400,
      message: "No file provided",
    });
  }

  const parsedFile = fileSchema.safeParse(file);
  if (!parsedFile.success) {
    throw createError({
      status: 400,
      message: "Invalid file",
    });
  }

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

  const optimizedBuffer = await optimizeImage({
    buffer: file.data,
    contentType: parsedFile.data.type,
    quality: 75,
    width: 500,
  });

  const { cid } = await ipfsUploadFile(event, {
    content: optimizedBuffer,
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: "nft media uploaded",
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
