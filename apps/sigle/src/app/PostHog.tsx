"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { env } from "@/env";
import { useSession } from "@/lib/auth-hooks";

export function PostHogInit(): null {
  const { data: session } = useSession();
  const posthog = usePostHog();

  useEffect(() => {
    if (env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
        autocapture: false,
        persistence: "localStorage",
        enable_heatmaps: false,
        ip: false,
        // Disable automatic pageview capture, as we capture manually
        capture_pageview: false,
        // Enable debug mode in development
        debug: process.env.NODE_ENV === "development",
      });
    }
  }, [posthog]);

  useEffect(() => {
    if (env.NEXT_PUBLIC_POSTHOG_KEY && session) {
      posthog.identify(session.user.id);
    }
  }, [posthog, session]);

  return null;
}

function PostHogPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }

      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

// Wrap this in Suspense to avoid the `useSearchParams` usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
export function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
