import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // TODO find a better way to do this
    domains: ['ipfs.io'],
  },
};

export default nextConfig;
