import { Fragment, useEffect } from 'react';
import { usePlausible } from 'next-plausible';
import { Router } from 'next/router';

type EventsPlausible = {
  pageview: {
    u: string;
  };
};

export const PlausibleTrack = () => {
  const plausible = usePlausible<EventsPlausible>();

  useEffect(() => {
    const trackPlausible = () => {
      plausible('pageview', { props: { u: window.location.href } });
    };

    // Track pageview on mount
    trackPlausible();
    Router.events.on('routeChangeComplete', trackPlausible);

    return () => {
      Router.events.off('routeChangeComplete', trackPlausible);
    };
  }, [plausible]);

  return <Fragment />;
};
