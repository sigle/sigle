export const resolveImageUrl = (image: string) => {
  if (image?.startsWith('ipfs://')) {
    image = `https://ipfs.io/ipfs/${image.slice(7)}`;
  }
  if (image?.startsWith('ar://')) {
    image = `https://arweave.net/${image.slice(5)}`;
  }
  return image;
};
