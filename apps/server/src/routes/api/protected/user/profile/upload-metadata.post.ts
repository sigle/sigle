import { ProfileMetadataSchema } from "@sigle/sdk";
import { fromError } from "zod-validation-error";
import { aerweaveUploadFile } from "~/lib/arweave";

defineRouteMeta({
  openAPI: {
    tags: ["users"],
    description: "Upload profile metadata to Arweave.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              metadata: {
                type: "object",
                description: "Profile metadata",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Metadata uploaded.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["id"],
              properties: {
                id: {
                  description: "Arweave ID.",
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const parsedMetadata = ProfileMetadataSchema.safeParse(body.metadata);
  if (!parsedMetadata.success) {
    throw createError({
      status: 400,
      message: `Invalid metadata: ${fromError(
        parsedMetadata.error,
      ).toString()}`,
    });
  }

  const { id } = await aerweaveUploadFile(event, {
    metadata: parsedMetadata.data,
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: "profile metadata uploaded",
    properties: {
      arweaveId: id,
    },
  });

  return {
    id,
  };
});
