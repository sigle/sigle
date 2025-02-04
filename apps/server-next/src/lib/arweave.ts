import type { H3Event } from 'h3';
import { env } from '~/env';
import IPFS from 'ipfs-only-hash';
import { TurboFactory } from '@ardrive/turbo-sdk/node';

const turboClient = TurboFactory.authenticated({
  privateKey: env.ARWEAVE_PRIVATE_KEY,
  token: 'solana',
});

export const generateCID = async (content: Buffer) => {
  return await IPFS.of(content);
};

interface ArweaveTag {
  name: string;
  value: string;
}

export const aerweaveUploadFile = async (
  event: H3Event,
  {
    metadata,
    tags = [],
  }: {
    metadata: object;
    tags?: ArweaveTag[];
  },
) => {
  const file = Buffer.from(JSON.stringify(metadata));
  const fileSize = file.byteLength;
  const cid = await generateCID(file);

  const arweaveTags: ArweaveTag[] = [
    {
      name: 'content-type',
      value: 'application/json',
    },
    {
      name: 'App-Name',
      value: env.APP_ID,
    },
    { name: 'IPFS-CID', value: cid },
    ...tags,
  ];

  try {
    const uploadResult = await turboClient.uploadFile({
      fileStreamFactory: () => file,
      fileSizeFactory: () => fileSize,
      dataItemOpts: {
        tags: arweaveTags,
      },
    });

    return { id: uploadResult.id };
  } catch (error) {
    const sentryId = event.context.$sentry.captureException(error, {
      level: 'error',
      extra: {
        metadata,
      },
    });
    throw createError({
      status: 500,
      message: `Failed to upload to Arweave, error: ${sentryId}`,
    });
  }
};
