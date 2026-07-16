import { defineRouteMeta } from "nitro";
import { HTTPError, defineEventHandler, getRouterParam } from "nitro/h3";
import { z } from "zod";
import { env } from "@/env";
import { allowedFormats, optimizeImage } from "@/lib/images";
import { ipfsUploadFile } from "@/lib/ipfs-upload";
import { readFormData } from "@/lib/nitro";
import { prisma } from "@/lib/prisma";
import { checkUploadQuota, recordUpload } from "@/lib/quota";
import { isUserWhitelisted } from "@/lib/users";

defineRouteMeta({
  openAPI: {
    tags: ["drafts"],
    description: "Upload draft media.",
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
      400: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/BadRequest",
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
  if (!isUserWhitelisted(event.context.user.id)) {
    throw new HTTPError({
      status: 403,
      message: "User is not whitelisted.",
    });
  }

  const draftId = getRouterParam(event, "draftId");
  const formData = await readFormData(event, "5mb");

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    throw new HTTPError({
      status: 400,
      message: "No file provided",
    });
  }

  const parsedFile = fileSchema.safeParse({
    name: file.name,
    filename: file.name,
    type: file.type,
  });
  if (!parsedFile.success) {
    throw new HTTPError({
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
    throw new HTTPError({
      status: 404,
      message: "Draft not found.",
    });
  }

  const optimizeResult = await optimizeImage({
    buffer: Buffer.from(await file.arrayBuffer()),
    contentType: parsedFile.data.type,
    quality: env.STACKS_ENV === "mainnet" ? 85 : 75,
    width: env.STACKS_ENV === "mainnet" ? 1000 : 700,
  });

  if (optimizeResult.isErr()) {
    throw new HTTPError({
      status: 400,
      message: "Failed to optimize image.",
    });
  }

  const optimizedBuffer = optimizeResult.value;

  const quotaResult = await checkUploadQuota(
    event.context.user.id,
    optimizedBuffer.length,
  );

  if (quotaResult.isErr()) {
    throw new HTTPError({
      status: 429,
      message: quotaResult.error.message,
    });
  }

  const uploadResult = await ipfsUploadFile(event, {
    content: optimizedBuffer,
    contentType: parsedFile.data.type,
  });

  if (uploadResult.isErr()) {
    throw new HTTPError({
      status: 500,
      message: uploadResult.error.message,
    });
  }

  const { cid } = uploadResult.value;

  await recordUpload({
    userId: event.context.user.id,
    cid,
    sizeBytes: optimizedBuffer.length,
    contentType: parsedFile.data.type,
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: "draft media uploaded",
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
