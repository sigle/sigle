import { parse } from "multiformats/link";
import { env } from "@/env";

export const resolveImageUrl = (
  image: string,
  options: { gateway?: boolean } = {},
) => {
  if (image?.startsWith("ipfs://")) {
    let cid = image.slice(7);
    // We convert the CID to a v1 CID if it's a v0 CID so that images can be served by subdomain gateways
    if (cid.startsWith("Qm")) {
      cid = parse(cid).toV1().toString();
    }
    // oxlint-disable-next-line no-param-reassign
    image =
      options.gateway && env.NEXT_PUBLIC_IPFS_GATEWAY_URL
        ? `${env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${cid}`
        : `https://${cid}.ipfs.w3s.link/`;
  }
  if (image?.startsWith("ar://")) {
    // oxlint-disable-next-line no-param-reassign
    image = `${env.NEXT_PUBLIC_ARWEAVE_GATEWAY_URL}/${image.slice(5)}`;
  }
  return image;
};
