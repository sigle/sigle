import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Result, TaggedError } from "better-result";
import { type H3Event } from "nitro/h3";
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

export class IpfsUploadFailedError extends TaggedError(
  "IpfsUploadFailedError",
)<{
  message: string;
  sentryId?: string;
}>() {}

export const ipfsUploadFile = async (
  event: H3Event,
  {
    content,
    contentType,
  }: {
    content: Buffer;
    contentType: string;
  },
): Promise<Result<{ cid: string }, IpfsUploadFailedError>> => {
  return Result.tryPromise({
    try: async () => {
      const computedCid = await createCIDv1FromBuffer(content);
      const Key = `u/${event.context.user.id}/${computedCid}`;

      const response = await s3Client.send(
        new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key,
          Body: content,
          ContentType: contentType,
        }),
      );

      const serverCid = (
        response.$metadata as { httpHeaders?: Record<string, string> }
      ).httpHeaders?.["x-amz-meta-cid"];

      if (serverCid && serverCid !== computedCid) {
        consola.warn("CID mismatch", { serverCid, computedCid });
        throw new IpfsUploadFailedError({
          message: "CID mismatch between client and server",
        });
      }

      if (!computedCid) {
        throw new IpfsUploadFailedError({
          message: "Failed to upload to IPFS, no cid found",
        });
      }

      return { cid: computedCid };
    },
    catch: (error) => {
      if (error instanceof IpfsUploadFailedError) {
        return error;
      }
      consola.error(error);
      const sentryId = event.context.$sentry.captureException(error);
      return new IpfsUploadFailedError({
        message: `Failed to upload to IPFS, error: ${sentryId}`,
        sentryId,
      });
    },
  });
};
