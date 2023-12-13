import { Router } from 'next/router';
import posthog from 'posthog-js';
import { Fragment, useEffect } from 'react';
import { sigleConfig } from '../../config';

export const PosthogTrack = () => {
  useEffect(() => {
    if (sigleConfig.posthogToken) {
      posthog.init(sigleConfig.posthogToken, {
        api_host: 'https://app.posthog.com',
        persistence: 'localStorage',
        ip: false,
        loaded: () => {
          if (sigleConfig.env === 'development') {
            posthog.opt_out_capturing();
          }
        },
      });
    }

    const handleRouteChange = () => {
      posthog.capture('$pageview');
    };

    Router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  return <Fragment />;
};
