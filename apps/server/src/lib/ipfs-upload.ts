import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { HTTPError, type H3Event } from "nitro/h3";
import { env } from "@/env";
import { consola } from "./consola";
import { createCIDv1FromBuffer } from "./ipfs";

const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export const ipfsUploadFile = async (
  event: H3Event,
  {
    content,
  }: {
    content: Buffer;
  },
) => {
  try {
    const computedCid = await createCIDv1FromBuffer(content);
    const Key = `u/${event.context.userId}/${computedCid}`;

    const response = await s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key,
        Body: content,
      }),
    );

    const serverCid = (
      response.$metadata as { httpHeaders?: Record<string, string> }
    ).httpHeaders?.["x-amz-meta-cid"];

    if (serverCid && serverCid !== computedCid) {
      consola.warn("CID mismatch", { serverCid, computedCid });
      throw new HTTPError({
        status: 500,
        message: "CID mismatch between client and server",
      });
    }

    if (!computedCid) {
      throw new HTTPError({
        status: 500,
        message: "Failed to upload to IPFS, no cid found",
      });
    }

    return { cid: computedCid };
  } catch (error) {
    consola.error(error);
    const sentryId = event.context.$sentry.captureException(error);
    throw new HTTPError({
      status: 500,
      message: `Failed to upload to IPFS, error: ${sentryId}`,
    });
  }
};
