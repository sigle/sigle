import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

// Public URL of the server-v2 image CDN (`R2_PUBLIC_URL` on the server), which
// serves uploaded profile and post images.
if (!process.env.CDN_URL) {
  throw new Error("CDN_URL is required");
}

const cdnUrl = new URL(process.env.CDN_URL);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.filebase.io",
        port: "",
        search: "",
      },
      // Profile image URLs carry a `?v=` version, so any query is allowed.
      {
        protocol: "https",
        hostname: cdnUrl.hostname,
        port: cdnUrl.port,
      },
    ],
  },
  serverExternalPackages: ["@stacks/connect"],
};

export default withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  telemetry: false,
  sourcemaps: {
    disable: true,
  },
  // Upload large source maps to Sentry
  widenClientFileUpload: true,
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayShadowDom: true,
    excludeReplayWorker: true,
    excludeReplayIframe: true,
    excludeTracing: true,
  },
});
