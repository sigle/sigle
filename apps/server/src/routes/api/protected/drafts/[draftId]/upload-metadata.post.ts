import { PostMetadataSchema } from "@sigle/sdk";
import { bytesToHex } from "@stacks/common";
import { hashMessage, verifyMessageSignatureRsv } from "@stacks/encryption";
import {
  createMessageSignature,
  publicKeyFromSignatureRsv,
  publicKeyToAddress,
} from "@stacks/transactions";
import { defineRouteMeta } from "nitro";
import { HTTPError, defineEventHandler, getRouterParam } from "nitro/h3";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { env } from "@/env";
import { generateImageBlurhashJob } from "@/jobs/generate-image-blurhash";
import { arweaveUploadFile } from "@/lib/arweave";
import { readValidatedBodyZod } from "@/lib/nitro";
import { prisma } from "@/lib/prisma";
import { isUserWhitelisted } from "@/lib/users";

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
  if (!isUserWhitelisted(event.context.user.id)) {
    throw new HTTPError({
      status: 403,
      message: "User is not whitelisted.",
    });
  }

  const draftId = getRouterParam(event, "draftId");
  const body = await readValidatedBodyZod(event, uploadMetadataDraftSchema);

  const parsedMetadata = PostMetadataSchema.safeParse(body.metadata);
  if (!parsedMetadata.success) {
    throw new HTTPError({
      status: 400,
      message: `Invalid metadata: ${fromError(parsedMetadata.error).toString()}`,
    });
  }

  // Verify that the signature is valid and resolves to the logged-in user's Stacks address
  const signature = parsedMetadata.data.signature;
  let recoveredAddress = "";
  try {
    const message = JSON.stringify(parsedMetadata.data.content);
    const messageHash = bytesToHex(hashMessage(message));
    const stacksSignature = createMessageSignature(signature);
    const publicKey = publicKeyFromSignatureRsv(
      messageHash,
      stacksSignature.data,
    );
    recoveredAddress = publicKeyToAddress(
      publicKey,
      env.STACKS_ENV === "mainnet" ? "mainnet" : "testnet",
    );

    const isSignatureValid = verifyMessageSignatureRsv({
      signature,
      message,
      publicKey,
    });
    if (!isSignatureValid || recoveredAddress !== event.context.user.id) {
      throw new HTTPError({
        status: 400,
        message:
          "Invalid signature: Signature verification failed or address mismatch",
      });
    }
  } catch (error) {
    throw new HTTPError({
      status: 400,
      message: `Invalid signature: Failed to recover signature: ${
        error instanceof Error ? error.message : error
      }`,
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

  if (!draft && body.type === "published") {
    // Also allow finding from Draft if we are publishing a draft
    const draftFromDrafts = await prisma.draft.findUnique({
      select: {
        id: true,
      },
      where: {
        id: draftId,
        userId: event.context.user.id,
      },
    });
    if (!draftFromDrafts) {
      throw new HTTPError({
        status: 404,
        message: "Draft not found.",
      });
    }
  } else if (!draft) {
    throw new HTTPError({
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
      throw new HTTPError({
        status: 400,
        message: "A post with this ID already exists.",
      });
    }
  }

  const uploadResult = await arweaveUploadFile(event, {
    metadata: parsedMetadata.data,
  });

  if (uploadResult.isErr()) {
    throw new HTTPError({
      status: 500,
      message: `Failed to upload to Arweave, error: ${uploadResult.error.sentryId}`,
    });
  }

  const { id } = uploadResult.value;

  // If the type is published, index it immediately in the database
  if (body.type === "published") {
    const postData = parsedMetadata.data;
    const metaTitle = postData.content.attributes?.find(
      (attribute) => attribute.key === "meta-title",
    )?.value;
    const metaDescription = postData.content.attributes?.find(
      (attribute) => attribute.key === "meta-description",
    )?.value;
    const excerpt = postData.content.attributes?.find(
      (attribute) => attribute.key === "excerpt",
    )?.value;
    const canonicalUri = postData.content.attributes?.find(
      (attribute) => attribute.key === "canonical-uri",
    )?.value;

    const versionSplit = postData.$schema.split("/");
    const version = versionSplit[versionSplit.length - 1].replace(".json", "");

    await prisma.$transaction(async (tx) => {
      const userId = event.context.user.id;

      const updatedPost = await tx.post.upsert({
        where: {
          id, // Use Arweave TX ID as post ID
        },
        update: {
          txId: id,
          version,
          blockHeight: 0,
        },
        create: {
          id,
          txId: id,
          version,
          blockHeight: 0,
          userId,
          createdAt: new Date(),

          // Metadata fields
          metadataUri: `ar://${id}`,
          title: postData.content.title,
          content: postData.content.content,
          metaTitle,
          metaDescription,
          excerpt: excerpt || "",
          tags: postData.content.tags,
          canonicalUri,
        },
      });

      if (postData.content.coverImage) {
        await tx.post.update({
          where: {
            id: updatedPost.id,
          },
          data: {
            coverImage: {
              connectOrCreate: {
                where: {
                  id: postData.content.coverImage.url,
                },
                create: {
                  id: postData.content.coverImage.url,
                  mimeType: postData.content.coverImage.type,
                },
              },
            },
          },
        });
      }
    });

    // Delete the associated draft
    await prisma.draft.deleteMany({
      where: {
        id: draftId,
        userId: event.context.user.id,
      },
    });

    if (postData.content.coverImage) {
      await generateImageBlurhashJob.emit({
        imageId: postData.content.coverImage.url,
      });
    }
  }

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
