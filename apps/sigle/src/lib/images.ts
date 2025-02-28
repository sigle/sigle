import { env } from "@/env";

export const resolveImageUrl = (
  image: string,
  options: { gateway?: boolean } = {},
) => {
  if (image?.startsWith("ipfs://")) {
    image =
      options.gateway && env.NEXT_PUBLIC_IPFS_GATEWAY_URL
        ? `${env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${image.slice(7)}`
        : `https://ipfs.io/ipfs/${image.slice(7)}`;
  }
  if (image?.startsWith("ar://")) {
    image = `https://arweave.net/${image.slice(5)}`;
  }
  return image;
};
