import type { NextConfig } from "next";
import { withPostHogConfig } from "@posthog/nextjs-config";

// Public URL of the server-v2 image CDN (`R2_PUBLIC_URL` on the server), which
// serves uploaded profile and post images.
if (!process.env.CDN_URL) {
  throw new Error("CDN_URL is required");
}

const cdnUrl = new URL(process.env.CDN_URL);

// Sent on every route. `frame-ancestors` (and `X-Frame-Options` for older
// browsers) stop other sites from framing Sigle, such as the editor whose
// publish dialog asks the wallet to sign. The referrer policy keeps the origin
// on cross-origin requests, which YouTube embeds require.
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

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
      {
        protocol: "https",
        hostname: cdnUrl.hostname,
        port: cdnUrl.port,
      },
    ],
  },
  serverExternalPackages: ["@stacks/connect"],
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
};

// Uploads the source maps of the build to PostHog error tracking, so stack
// traces show the original code, then deletes them so they are not served.
// Only on Railway builds, where POSTHOG_PERSONAL_API_KEY is set.
const posthogPersonalApiKey = process.env.POSTHOG_PERSONAL_API_KEY;

const posthogProjectId = process.env.POSTHOG_PROJECT_ID;

export default withPostHogConfig(nextConfig, {
  personalApiKey: posthogPersonalApiKey ?? "",
  projectId: posthogProjectId,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  sourcemaps: {
    enabled: Boolean(posthogPersonalApiKey && posthogProjectId),
    releaseName: "sigle-web",
    // The Docker build has no .git to read the commit from
    releaseVersion: process.env.RAILWAY_GIT_COMMIT_SHA,
    // A failed upload deletes the source maps and keeps the deploy going
    failOnError: false,
  },
});
