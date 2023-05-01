import { Router } from 'next/router';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export const PosthogTrack = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: 'https://app.posthog.com',
        ip: false,
        loaded: () => {
          if (process.env.NODE_ENV === 'development') {
            posthog.debug();
          }
        },
      });
    }

    const handleRouteChange = () => posthog.capture('$pageview');
    Router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
};
