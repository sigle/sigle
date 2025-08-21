import { createError, defineEventHandler, getRouterParam } from "h3";
import { defineRouteMeta } from "nitropack/runtime";
import { prisma, SELECT_PUBLIC_USER_FIELDS } from "~/lib/prisma";
import { sites } from "~/sites";

defineRouteMeta({
  openAPI: {
    tags: ["sites"],
    description: "Get user site.",
    responses: {
      200: {
        description: "User site.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["address", "url", "banner", "links", "user"],
              properties: {
                address: { type: "string" },
                url: { type: "string" },
                banner: { type: "string" },
                links: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["href", "label"],
                    properties: {
                      href: { type: "string" },
                      label: { type: "string" },
                    },
                  },
                },
                cta: {
                  type: "object",
                  required: ["href", "label"],
                  properties: {
                    href: { type: "string" },
                    label: { type: "string" },
                  },
                },
                user: {
                  $ref: "#/components/schemas/UserProfile",
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

export default defineEventHandler(async (event) => {
  const domain = getRouterParam(event, "domain");
  if (!domain) {
    throw createError({
      status: 400,
      statusMessage: "Bad Request",
    });
  }

  const site = sites[decodeURIComponent(domain)];
  if (!site) {
    throw createError({
      status: 404,
      statusMessage: "Site not found",
    });
  }

  const user = await prisma.user.findUnique({
    select: SELECT_PUBLIC_USER_FIELDS,
    where: {
      id: site.address,
    },
  });
  if (!user) {
    throw createError({
      status: 404,
      statusMessage: "User not found",
    });
  }

  return {
    ...site,
    user,
  };
});
