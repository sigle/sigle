import posthog from "posthog-js";
import { env } from "@/env";

// Runs before the app hydrates, so PostHog is ready even when the root layout
// fails and `global-error.tsx` renders without the providers. `PostHogProvider`
// uses this same instance.
if (env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    autocapture: false,
    persistence: "localStorage",
    enable_heatmaps: false,
    ip: false,
    // Report uncaught errors and unhandled promise rejections to error
    // tracking.
    capture_exceptions: true,
    // Disable automatic pageview capture, as we capture manually
    capture_pageview: false,
    // Enable debug mode in development
    debug: process.env.NODE_ENV === "development",
  });
}
