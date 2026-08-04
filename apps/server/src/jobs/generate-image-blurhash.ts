import sharp from "sharp";
import { z } from "zod";
import { consola } from "@/lib/consola";
import { generateBlurhash, resolveImageUrl } from "@/lib/images";
import { defineJob } from "@/lib/jobs";
import { prisma } from "@/lib/prisma";

export async function processImageBlurhashStep(imageId: string) {
  "use step";
  const mediaImage = await prisma.mediaImage.findUnique({
    where: {
      id: imageId,
    },
  });
  if (!mediaImage) {
    throw new Error("Image not found");
  }

  const mediaUrl = resolveImageUrl(mediaImage.id);
  const imageResponse = await fetch(mediaUrl);
  if (!imageResponse.ok) {
    throw new Error("Failed to fetch image");
  }
  const imageBuffer = await imageResponse.arrayBuffer();
  const { width, height, size } = await sharp(
    Buffer.from(imageBuffer),
  ).metadata();

  const blurhashResult = await generateBlurhash({ buffer: imageBuffer });
  if (blurhashResult.isErr()) {
    throw blurhashResult.error;
  }
  const blurhash = blurhashResult.value;

  await prisma.mediaImage.update({
    where: {
      id: mediaImage.id,
    },
    data: {
      blurhash,
      width,
      height,
      size,
    },
  });

  consola.debug("generate-image-blurhash", {
    imageId,
  });
}

export async function generateImageBlurhashWorkflow(data: { imageId: string }) {
  "use workflow";
  await processImageBlurhashStep(data.imageId);
}

export const generateImageBlurhashJob = defineJob("generate-image-blurhash")
  .input(
    z.object({
      imageId: z.string(),
    }),
  )
  .work(generateImageBlurhashWorkflow);
