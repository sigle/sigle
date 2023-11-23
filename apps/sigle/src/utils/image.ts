export const resizeImage = (
  file: File,
  options: {
    maxWidth: number;
  },
): Promise<Blob & { preview: string }> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const reader = new FileReader();
    reader.onload = function () {
      const img = new Image();
      img.onload = function () {
        // image is loaded; sizes are available
        let width = img.width;
        let height = img.height;
        if (width > options.maxWidth) {
          height *= options.maxWidth / width;
          width = options.maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataurl = canvas.toDataURL(file.type);
        canvas.toBlob(
          (blob) => {
            resolve(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- blob is not null
              Object.assign(blob!, {
                preview: dataurl,
              }),
            );
          },
          file.type,
          0.9,
        );
      };

      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};
