import type { NextConfig } from "next";
import { withPostHogConfig } from "@posthog/nextjs-config";

// Public URL of the server-v2 image CDN (`R2_PUBLIC_URL` on the server), which
// serves uploaded profile and post images.
if (!process.env.CDN_URL) {
  throw new Error("CDN_URL is required");
}

const cdnUrl = new URL(process.env.CDN_URL);

// The only frames a page embeds are the YouTube videos of posts, in the reader
// and in the editor. Their URL is built from a link the author wrote, on any
// of these hosts.
const frameSources = [
  "https://www.youtube.com",
  "https://www.youtube-nocookie.com",
  "https://youtube.com",
  "https://music.youtube.com",
  "https://youtu.be",
];

// The policy of pages. `frame-ancestors` (and `X-Frame-Options` for older
// browsers) stop other sites from framing Sigle, such as the editor whose
// publish dialog asks the wallet to sign. The other directives close what no
// page uses: a `<base>` pointing links elsewhere, forms posting to another
// site, plugins, and frames of other sites.
//
// Scripts, styles, images and connections are not restricted. Next.js renders
// inline scripts, which a static policy can only allow as a whole, wallet
// extensions add their own script to the page, and posts show images of any
// host.
const pageContentSecurityPolicy = [
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  `frame-src ${frameSources.join(" ")}`,
  "object-src 'none'",
].join("; ");

// The policy of route handlers, which answer JSON and RSS for other programs
// to read. A browser opening one of them as a page loads and runs nothing.
const apiContentSecurityPolicy = [
  "default-src 'none'",
  "frame-ancestors 'none'",
  "sandbox",
].join("; ");

// Sent on every route. The referrer policy keeps the origin on cross-origin
// requests, which YouTube embeds require.
const securityHeaders = [
  { key: "Content-Security-Policy", value: pageContentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // The optimizer refuses images from this machine unless allowed to. Only
    // the end-to-end tests have their CDN there, served by the test API.
    dangerouslyAllowLocalIP: cdnUrl.hostname === "localhost",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.filebase.io",
        port: "",
        search: "",
      },
      {
        protocol: cdnUrl.protocol === "http:" ? "http" : "https",
        hostname: cdnUrl.hostname,
        port: cdnUrl.port,
      },
    ],
  },
  serverExternalPackages: ["@stacks/connect"],
  // When two entries set the same header for a path, the last one wins.
  headers: async () => [
    { source: "/:path*", headers: securityHeaders },
    {
      source: "/api/:path*",
      headers: [
        { key: "Content-Security-Policy", value: apiContentSecurityPolicy },
      ],
    },
  ],
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
