import type { H3Event } from 'h3';
import { env } from '~/env';
import IPFS from 'ipfs-only-hash';
import { TurboFactory } from '@ardrive/turbo-sdk/node';
import { consola } from './consola';

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
  consola.log('step 2.1');
  const file = Buffer.from(JSON.stringify(metadata));
  const fileSize = file.byteLength;
  consola.log('step 2.2');
  const cid = await generateCID(file);
  consola.log('step 2.3');

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
    consola.log('step 2.4');

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
