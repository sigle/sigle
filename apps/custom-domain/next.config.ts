import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.filebase.io",
        port: "",
        search: "",
      },
    ],
  },
};

export default nextConfig;
