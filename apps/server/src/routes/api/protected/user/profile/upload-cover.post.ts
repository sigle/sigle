import { z } from "zod";
import { allowedFormats, optimizeImage } from "~/lib/images";
import { ipfsUploadFile } from "~/lib/ipfs-upload";
import { readMultipartFormDataSafe } from "~/lib/nitro";

defineRouteMeta({
  openAPI: {
    tags: ["users"],
    description: "Upload cover picture for a profile.",
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
        description: "Cover uploaded",
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
    width: 2000,
  });

  const { cid } = await ipfsUploadFile(event, {
    content: optimizedBuffer,
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: "profile cover media uploaded",
    properties: {
      cid,
    },
  });

  return {
    cid: cid.toString(),
    url: `ipfs://${cid}`,
  };
});
