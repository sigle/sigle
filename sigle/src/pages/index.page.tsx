import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Protected } from '../modules/auth/Protected';
import { Home } from '../modules/home';
import {
  enableExperimentalAnalyticsPage,
  isExperimentalAnalyticsPageEnabled,
} from '../utils/featureFlags';

const HomePage = () => {
  const router = useRouter();
  const isExperimentalAnalyticsPage =
    router.query.experimentalAnalyticsPage === 'true';

  useEffect(() => {
    if (isExperimentalAnalyticsPage && !isExperimentalAnalyticsPageEnabled) {
      enableExperimentalAnalyticsPage();
    }
  }, [isExperimentalAnalyticsPage]);

  return (
    <Protected>
      <Home type="drafts" />
    </Protected>
  );
};

export default HomePage;
