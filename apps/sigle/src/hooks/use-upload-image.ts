import { useMutation } from '@tanstack/react-query';
import { resizeImage } from '@/utils/image';
import { storage } from '@/utils/stacks';

export const useUploadImage = () => {
  return useMutation<
    {
      url: string;
    },
    string,
    {
      file: File;
      path: string;
      maxWidth: number;
    }
  >({
    mutationFn: async ({ file, path, maxWidth }) => {
      const blob = await resizeImage(file, { maxWidth });
      const coverImageUrl = await storage.putFile(path, blob, {
        encrypt: false,
        contentType: blob.type,
      });
      return { url: coverImageUrl };
    },
  });
};
