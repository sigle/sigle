import { createError, defineEventHandler, getRouterParam } from "h3";
import { defineRouteMeta } from "nitropack/runtime";
import { prisma } from "~/lib/prisma";

defineRouteMeta({
  openAPI: {
    tags: ["drafts"],
    description: "Get draft for the current profile.",
    responses: {
      200: {
        description: "Draft entry.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["id", "type", "title", "createdAt", "updatedAt"],
              properties: {
                id: {
                  type: "string",
                },
                type: {
                  type: "string",
                  enum: ["draft", "published"],
                },
                title: {
                  type: "string",
                },
                content: {
                  type: "string",
                },
                metaTitle: {
                  type: "string",
                },
                metaDescription: {
                  type: "string",
                },
                coverImage: {
                  type: "string",
                },
                tags: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                canonicalUri: {
                  type: "string",
                },
                collectPriceType: {
                  type: "string",
                  enum: ["free", "paid"],
                },
                collectPrice: {
                  type: "string",
                },
                collectLimitType: {
                  type: "string",
                  enum: ["open", "fixed"],
                },
                collectLimit: {
                  type: "number",
                },
                txId: {
                  type: "string",
                },
                txStatus: {
                  type: "string",
                },
                createdAt: {
                  type: "string",
                },
                updatedAt: {
                  type: "string",
                },
              },
            },
          },
        },
      },
      404: {
        description: "Draft not found.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Draft not found.",
                },
                statusCode: {
                  type: "number",
                  example: 404,
                },
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler<
  Request,
  Promise<{
    id: string;
    type: string;
    title: string;
    content: string;
    metaTitle: string | null;
    metaDescription: string | null;
    coverImage: string | null;
    txId: string | null;
    collectLimitType: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>
>(async (event) => {
  const draftId = getRouterParam(event, "draftId");

  if (!draftId) {
    throw createError({
      status: 400,
      statusMessage: "Bad Request",
    });
  }

  const draft = await prisma.draft.findUnique({
    select: {
      id: true,
      title: true,
      content: true,
      metaTitle: true,
      metaDescription: true,
      coverImage: true,
      tags: true,
      canonicalUri: true,
      collectPriceType: true,
      collectPrice: true,
      collectLimitType: true,
      collectLimit: true,
      txId: true,
      txStatus: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      id: draftId,
      userId: event.context.user.id,
    },
  });

  // If draft is not found we try to get the published version
  if (!draft) {
    const published = await prisma.post.findUnique({
      select: {
        id: true,
        title: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        coverImageId: true,
        tags: true,
        canonicalUri: true,
        txId: true,
        openEdition: true,
        maxSupply: true,
        minterFixedPrice: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        id: draftId,
        userId: event.context.user.id,
      },
    });

    if (!published) {
      throw createError({
        status: 404,
        statusMessage: "Not Found",
      });
    }

    return {
      id: published.id,
      type: "published",
      title: published.title,
      content: published.content,
      metaTitle: published.metaTitle,
      metaDescription: published.metaDescription,
      coverImage: published.coverImageId,
      tags: published.tags,
      canonicalUri: published.canonicalUri,
      txId: published.txId,
      collectPriceType:
        published.minterFixedPrice && published.minterFixedPrice.price > 0
          ? "paid"
          : "free",
      collectPrice: published.minterFixedPrice?.price,
      collectLimitType: published.openEdition ? "open" : "fixed",
      collectLimit: published.maxSupply,
      createdAt: published.createdAt,
      updatedAt: published.updatedAt,
    };
  }

  if (!draft) {
    throw createError({
      status: 404,
      statusMessage: "Not Found",
    });
  }

  return {
    ...draft,
    type: "draft",
  };
});
