import type { H3Event } from 'h3';
import { env } from '~/env';
import { Uploader } from '@irys/upload';
import { Solana } from '@irys/upload-solana';
import IPFS from 'ipfs-only-hash';

export const generateCID = async (content: Buffer) => {
  return await IPFS.of(content);
};

const getIrysUploader = async () => {
  const irysUploader = await Uploader(Solana).withWallet(env.IRYS_PRIVATE_KEY);
  return irysUploader;
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
  // TODO can this client be shared between requests?
  const irys = await getIrysUploader();

  // TODO create IPFS CID for file?
  // see https://docs.irys.xyz/build/d/features/ipfs-cid#content-ids-vs-transaction-ids

  const arweaveTags: ArweaveTag[] = [
    {
      name: 'content-type',
      value: 'application/json',
    },
    {
      name: 'App-Name',
      value: env.APP_ID,
    },
    ...tags,
  ];

  try {
    const receipt = await irys.upload(JSON.stringify(metadata), {
      tags: arweaveTags,
    });

    return { id: receipt.id };
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
