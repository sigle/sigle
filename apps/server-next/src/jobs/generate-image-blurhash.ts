import sharp from 'sharp';
import { z } from 'zod';
import { consola } from '~/lib/consola';
import { generateBlurhashURI, resolveImageUrl } from '~/lib/images';
import { defineJob } from '~/lib/jobs';
import { prisma } from '~/lib/prisma';

export const generateImageBlurhashJob = defineJob('generate-image-blurhash')
  .input(
    z.object({
      imageId: z.string(),
    }),
  )
  .options({
    priority: 1,
    retryLimit: 2,
    retryDelay: 60000,
  })
  .work(async ([job]) => {
    const mediaImage = await prisma.mediaImage.findUnique({
      where: {
        id: job.data.imageId,
      },
    });
    if (!mediaImage) {
      throw new Error('Image not found');
    }

    const mediaUrl = resolveImageUrl(mediaImage.id);
    const imageResponse = await fetch(mediaUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const { width, height } = await sharp(Buffer.from(imageBuffer)).metadata();

    const blurhash = await generateBlurhashURI({ buffer: imageBuffer });

    await prisma.mediaImage.update({
      where: {
        id: mediaImage.id,
      },
      data: {
        blurhash,
        width,
        height,
      },
    });

    consola.debug('generate-image-blurhash', {
      imageId: job.data.imageId,
    });
  });
