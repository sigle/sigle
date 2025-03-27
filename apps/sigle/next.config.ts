import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // TODO find a better way to do this
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ipfs.w3s.link",
        port: "",
        search: "",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  telemetry: false,
  sourcemaps: {
    disable: true,
  },
  // Upload large source maps to Sentry
  widenClientFileUpload: true,
  // Disable logger to save bundle size
  disableLogger: true,
});
