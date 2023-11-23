import { resizeImage } from '../../../utils/image';
import { storage } from '../../../utils/blockstack';

export const resizeAndUploadImage = async (
  image: File,
  name: string,
): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.readAsDataURL(image);

    reader.addEventListener('load', async () => {
      // Resize the image client side for faster upload and to save storage space
      // We skip resizing gif as it's turning them as single image
      let blob: Blob | File = image;
      if (image.type !== 'image/gif') {
        blob = await resizeImage(image, { maxWidth: 2000 });
      }

      const imageUrl = await storage.putFile(name, blob as any, {
        encrypt: false,
        contentType: image.type,
      });

      resolve(imageUrl);
    });
  });
};
