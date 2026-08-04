import sharp from "sharp";
import { z } from "zod";
import { consola } from "@/lib/consola";
import { generateBlurhash, resolveImageUrl } from "@/lib/images";
import { withStepSentry } from "@/lib/jobs";
import { prisma } from "@/lib/prisma";

export const generateImageBlurhashSchema = z.object({
  imageId: z.string(),
});

export async function processImageBlurhashStep(imageId: string) {
  "use step";
  return withStepSentry("processImageBlurhashStep", async () => {
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
  });
}

export async function generateImageBlurhashWorkflow(
  data: z.infer<typeof generateImageBlurhashSchema>,
) {
  "use workflow";
  await processImageBlurhashStep(data.imageId);
}
