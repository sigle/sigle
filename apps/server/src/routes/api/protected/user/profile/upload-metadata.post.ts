import {
  ArweaveTags,
  ArweaveTransactionTypes,
  ProfileMetadataSchema,
  verifyPostSignature,
} from "@sigle/sdk";
import { defineRouteMeta } from "nitro";
import { HTTPError, defineEventHandler } from "nitro/h3";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { env } from "@/env";
import { arweaveUploadFile } from "@/lib/arweave";
import { prisma } from "@/lib/prisma";

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
  const body = z
    .object({ metadata: z.unknown() })
    .safeParse(await event.req.json());

  const parsedMetadata = ProfileMetadataSchema.safeParse(
    body.success ? body.data.metadata : {},
  );

  if (!parsedMetadata.success) {
    throw new HTTPError({
      status: 400,
      message: `Invalid metadata: ${fromError(parsedMetadata.error).toString()}`,
    });
  }

  // Verify that the signature is valid and resolves to the logged-in user's Stacks address
  const signatureResult = verifyPostSignature(parsedMetadata.data, {
    network: env.STACKS_ENV === "mainnet" ? "mainnet" : "testnet",
  });

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

  const existingProfileWithSignature = await prisma.profile.findFirst({
    select: {
      id: true,
    },
    where: {
      signature,
    },
  });

  if (existingProfileWithSignature) {
    throw new HTTPError({
      status: 400,
      message: "Metadata signature has already been published.",
    });
  }

  const uploadResult = await arweaveUploadFile({
    file: Buffer.from(JSON.stringify(parsedMetadata.data)),
    contentType: "application/json",
    tags: [
      {
        name: ArweaveTags.author,
        value: event.context.user.id,
      },
      {
        name: ArweaveTags.type,
        value: ArweaveTransactionTypes.profile,
      },
    ],
  });

  if (uploadResult.isErr()) {
    throw new HTTPError({
      status: 500,
      message: `Failed to upload to Arweave, error: ${uploadResult.error.sentryId}`,
    });
  }

  const { id } = uploadResult.value;

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
