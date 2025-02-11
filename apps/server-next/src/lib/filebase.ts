import {
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { consola } from "./consola";
import type { H3Event } from "h3";
import { env } from "~/env";

const client = new S3Client({
  endpoint: "https://s3.filebase.com",
  region: "us-east-1",
  credentials: {
    accessKeyId: env.FILEBASE_ACCESS_KEY,
    secretAccessKey: env.FILEBASE_SECRET_KEY,
  },
});

export const ipfsUploadFile = async (
  event: H3Event,
  {
    path,
    content,
  }: {
    path: string;
    content: Buffer;
  },
) => {
  let cid: string | undefined;
  const command = new PutObjectCommand({
    Bucket: env.FILEBASE_BUCKET,
    Key: path,
    Body: content,
  });

  command.middlewareStack.add(
    (next) => async (args) => {
      // Check if request is incoming as middleware works both ways
      const data = await next(args);
      const response: {
        statusCode?: number;
        headers?: Record<string, string>;
      } = data.response as any;
      if (!response.statusCode) return data;

      // Get cid from headers
      cid = response.headers?.["x-amz-meta-cid"];
      return data;
    },
    {
      step: "build",
      name: "addCidToOutput",
    },
  );

  try {
    await client.send(command);

    if (!cid) {
      throw createError({
        status: 500,
        message: "Failed to upload to IPFS, no cid found",
      });
    }

    return { cid };
  } catch (error) {
    if (error instanceof S3ServiceException) {
      consola.error(
        `Error from S3 while uploading object. ${error.name}: ${error.message}`,
      );
    }
    const sentryId = event.context.$sentry.captureException(error, {
      extra: {
        path,
      },
    });
    throw createError({
      status: 500,
      message: `Failed to upload to IPFS, error: ${sentryId}`,
    });
  }
};
