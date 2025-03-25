import { create } from "@web3-storage/w3up-client";
import type { H3Event } from "h3";
import { env } from "~/env";

const w3upClient = await create();

// const client = new S3Client({
//   endpoint: "https://s3.filebase.com",
//   region: "us-east-1",
//   credentials: {
//     accessKeyId: env.FILEBASE_ACCESS_KEY,
//     secretAccessKey: env.FILEBASE_SECRET_KEY,
//   },
// });

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
  try {
    const cid = (await w3upClient.uploadFile(new Blob([content]))).toString();

    console.log("cid", cid);

    if (!cid) {
      throw createError({
        status: 500,
        message: "Failed to upload to IPFS, no cid found",
      });
    }

    return { cid };
  } catch (error) {
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
