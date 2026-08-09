import { TurboFactory } from "@ardrive/turbo-sdk";
import { Result, TaggedError } from "better-result";
import { type H3Event } from "nitro/h3";
import { env } from "@/env";
import { createCIDv1FromBuffer } from "./ipfs";

const turboClient = TurboFactory.authenticated({
  privateKey: env.ARWEAVE_PRIVATE_KEY,
  token: "solana",
});

export type ArweaveContentType = "application/json";

interface ArweaveTag {
  name: string;
  value: string;
}

export class ArweaveUploadFailedError extends TaggedError(
  "ArweaveUploadFailedError",
)<{
  cause: unknown;
  sentryId: string;
}>() {}

export const arweaveUploadFile = async (
  event: H3Event,
  {
    file,
    contentType,
    tags = [],
  }: {
    file: Buffer;
    contentType: ArweaveContentType;
    tags?: ArweaveTag[];
  },
): Promise<Result<{ id: string }, ArweaveUploadFailedError>> => {
  const fileSize = file.byteLength;
  const cid = await createCIDv1FromBuffer(file);

  const arweaveTags: ArweaveTag[] = [
    {
      name: "Content-Type",
      value: contentType,
    },
    {
      name: "App-Name",
      value: env.APP_ID,
    },
    { name: "IPFS-CID", value: cid },
    ...tags,
  ];

  return Result.tryPromise({
    try: async () => {
      const uploadResult = await turboClient.uploadFile({
        fileStreamFactory: () => file,
        fileSizeFactory: () => fileSize,
        dataItemOpts: {
          tags: arweaveTags,
        },
      });

      return { id: uploadResult.id };
    },
    catch: (error) => {
      const sentryId = event.context.$sentry.captureException(error, {
        level: "error",
        extra: {
          contentType,
          tags: arweaveTags,
        },
      });
      return new ArweaveUploadFailedError({ cause: error, sentryId });
    },
  });
};
