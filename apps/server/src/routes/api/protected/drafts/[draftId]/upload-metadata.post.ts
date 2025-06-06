import { PostMetadataSchema } from "@sigle/sdk";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { aerweaveUploadFile } from "~/lib/arweave";
import { readValidatedBodyZod } from "~/lib/nitro";
import { prisma } from "~/lib/prisma";

defineRouteMeta({
  openAPI: {
    tags: ["drafts"],
    description: "Upload draft metadata to Arweave.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["type", "metadata"],
            properties: {
              type: {
                type: "string",
                enum: ["draft", "published"],
              },
              metadata: {
                type: "object",
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

const uploadMetadataDraftSchema = z.object({
  metadata: z.any(),
  type: z.enum(["draft", "published"]),
});

export default defineEventHandler(async (event) => {
  const draftId = getRouterParam(event, "draftId");
  const body = await readValidatedBodyZod(event, uploadMetadataDraftSchema);

  const parsedMetadata = PostMetadataSchema.safeParse(body.metadata);
  if (!parsedMetadata.success) {
    throw createError({
      status: 400,
      message: `Invalid metadata: ${fromError(
        parsedMetadata.error,
      ).toString()}`,
    });
  }

  const draft =
    body.type === "draft"
      ? await prisma.draft.findUnique({
          select: {
            id: true,
          },
          where: {
            id: draftId,
            userId: event.context.user.id,
          },
        })
      : await prisma.post.findUnique({
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

  if (body.type === "draft") {
    // Check that a published post with the same id does not exist to ensure id uniqueness
    const post = await prisma.post.findUnique({
      select: {
        id: true,
      },
      where: {
        id: draftId,
      },
    });
    if (post) {
      throw createError({
        status: 400,
        message: "A post with this ID already exists.",
      });
    }
  }

  const { id } = await aerweaveUploadFile(event, {
    metadata: parsedMetadata.data,
  });

  event.context.$posthog.capture({
    distinctId: event.context.user.id,
    event: "draft metadata uploaded",
    properties: {
      arweaveId: id,
      draftId,
      type: body.type,
    },
  });

  return { id };
});
