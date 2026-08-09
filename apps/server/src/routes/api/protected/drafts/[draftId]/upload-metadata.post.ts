import { PostMetadataSchema } from "@sigle/sdk";
import { defineRouteMeta } from "nitro";
import { HTTPError, defineEventHandler, getRouterParam } from "nitro/h3";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { generateImageBlurhashJob } from "@/jobs/generate-image-blurhash";
import { opentimestampsStampJob } from "@/jobs/opentimestamps-stamp";
import { arweaveUploadFile } from "@/lib/arweave";
import { verifyPostSignature } from "@/lib/metadata";
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
              required: ["id", "postId", "arweaveId"],
              properties: {
                id: {
                  description: "Post ID.",
                  type: "string",
                },
                postId: {
                  description: "Post ID.",
                  type: "string",
                },
                arweaveId: {
                  description: "Arweave transaction ID.",
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
  if (!draftId) {
    throw new HTTPError({
      status: 400,
      message: "Bad Request",
    });
  }
  const body = await readValidatedBodyZod(event, uploadMetadataDraftSchema);

  const parsedMetadata = PostMetadataSchema.safeParse(body.metadata);
  if (!parsedMetadata.success) {
    throw new HTTPError({
      status: 400,
      message: `Invalid metadata: ${fromError(parsedMetadata.error).toString()}`,
    });
  }

  // Verify that the signature is valid and resolves to the logged-in user's Stacks address
  const signatureResult = verifyPostSignature(parsedMetadata.data);
  if (signatureResult.isErr()) {
    throw new HTTPError({
      status: 400,
      message: signatureResult.error.error,
    });
  }
  const { recoveredAddress, signature } = signatureResult.value;
  if (recoveredAddress !== event.context.user.id) {
    throw new HTTPError({
      status: 400,
      message:
        "Invalid signature: Signature verification failed or address mismatch",
    });
  }

  const existingPostWithSignature = await prisma.post.findUnique({
    select: {
      id: true,
    },
    where: {
      signature,
    },
  });
  if (existingPostWithSignature) {
    throw new HTTPError({
      status: 400,
      message: "Metadata signature has already been published.",
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
    throw new HTTPError({
      status: 404,
      message: body.type === "draft" ? "Draft not found." : "Post not found.",
    });
  }

  const tags: Array<{ name: string; value: string }> = [
    {
      name: "Author",
      value: event.context.user.id,
    },
  ];
  if (body.type === "published") {
    tags.push({
      name: "Root-TX",
      value: draftId,
    });
  }

  const uploadResult = await arweaveUploadFile({
    file: Buffer.from(JSON.stringify(parsedMetadata.data)),
    contentType: "application/json",
    tags,
  });

  if (uploadResult.isErr()) {
    throw new HTTPError({
      status: 500,
      message: `Failed to upload to Arweave, error: ${uploadResult.error.sentryId}`,
    });
  }

  const { id } = uploadResult.value;

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

  const targetPostId = body.type === "published" ? draftId : id;

  await prisma.$transaction(async (tx) => {
    const userId = event.context.user.id;

    const existingPost = await tx.post.findUnique({
      select: {
        id: true,
        txId: true,
        createdAt: true,
      },
      where: {
        id: targetPostId,
      },
    });

    if (existingPost && existingPost.txId !== id) {
      await tx.postRevision.upsert({
        where: {
          postId_txId: {
            postId: targetPostId,
            txId: existingPost.txId,
          },
        },
        update: {},
        create: {
          postId: targetPostId,
          txId: existingPost.txId,
          createdAt: existingPost.createdAt,
        },
      });
    }

    const sharedMetadata = {
      metadataUri: `ar://${id}`,
      title: postData.content.title,
      content: postData.content.content,
      metaTitle: metaTitle ?? null,
      metaDescription: metaDescription ?? null,
      excerpt: excerpt || "",
      tags: postData.content.tags,
      canonicalUri: canonicalUri ?? null,
    };

    const updatedPost = existingPost
      ? await tx.post.update({
          where: {
            id: targetPostId,
          },
          data: {
            ...sharedMetadata,
            txId: id,
            version,
            blockHeight: 0,
            signature,
            revisionsCount: {
              increment: 1,
            },
          },
        })
      : await tx.post.create({
          data: {
            ...sharedMetadata,
            id: targetPostId,
            txId: id,
            version,
            blockHeight: 0,
            signature,
            userId,
            createdAt: new Date(),
            revisionsCount: 1,
          },
        });

    await tx.postRevision.upsert({
      where: {
        postId_txId: {
          postId: targetPostId,
          txId: id,
        },
      },
      update: {},
      create: {
        postId: targetPostId,
        txId: id,
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

  await opentimestampsStampJob.emit({
    postId: targetPostId,
    txId: id,
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

  return {
    id: targetPostId,
    postId: targetPostId,
    arweaveId: id,
  };
});
