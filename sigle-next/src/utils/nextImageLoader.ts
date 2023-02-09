import { ImageLoader } from 'next/image';

export const nextImageLoader: ImageLoader = ({ src, width, quality }) => {
  return `https://wsrv.nl/?url=${src}&w=${width}&q=${quality || 75}`;
};
