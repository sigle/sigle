import { z } from "zod";
import { env } from "~/env";
import { ipfsUploadFile } from "~/lib/filebase";
import {
  allowedFormats,
  mimeTypeToExtension,
  optimizeImage,
} from "~/lib/images";
import { readMultipartFormDataSafe } from "~/lib/nitro";

defineRouteMeta({
  openAPI: {
    tags: ["users"],
    description: "Upload avatar for a profile.",
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
        description: "Avatar uploaded",
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

const fileSchema = z.object({
  name: z.string(),
  filename: z.string(),
  type: z.enum(allowedFormats),
});

export default defineEventHandler(async (event) => {
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

  const optimizedBuffer = await optimizeImage({
    buffer: file.data,
    contentType: parsedFile.data.type,
    quality: 75,
    width: 600,
  });

  const { cid } = await ipfsUploadFile(event, {
    path: `${event.context.user.id}/profile.${mimeTypeToExtension(
      parsedFile.data.type,
    )}`,
    content: optimizedBuffer,
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: "profile media uploaded",
    properties: {
      cid,
    },
  });

  return {
    cid: cid.toString(),
    url: `ipfs://${cid}`,
    gatewayUrl: `${env.IPFS_GATEWAY_URL}/ipfs/${cid}`,
  };
});
