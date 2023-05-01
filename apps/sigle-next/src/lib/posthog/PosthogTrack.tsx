import { useSession } from 'next-auth/react';
import { Router } from 'next/router';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export const PosthogTrack = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        // TODO setup proxy for production https://posthog.com/docs/advanced/proxy/nextjs
        api_host: 'https://app.posthog.com',
        ip: false,
        loaded: () => {
          if (process.env.NODE_ENV === 'development') {
            posthog.opt_out_capturing();
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

  useEffect(() => {
    if (session && session.user) {
      posthog.identify(session.user.id);
    }
  }, [session]);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
};
