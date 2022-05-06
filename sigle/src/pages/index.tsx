import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Protected } from '../modules/auth/Protected';
import { Home } from '../modules/home';
import {
  enableExperimentalAnalyticsPage,
  enableExperimentalHiroWallet,
  isExperimentalAnalyticsPageEnabled,
  isExperimentalHiroWalletEnabled,
} from '../utils/featureFlags';

const HomePage = () => {
  const router = useRouter();
  const isExperimentalHiroWallet =
    router.query.experimentalHiroWallet === 'true';
  const isExperimentalAnalyticsPage =
    router.query.experimentalAnalyticsPage === 'true';

  useEffect(() => {
    if (isExperimentalHiroWallet && !isExperimentalHiroWalletEnabled) {
      enableExperimentalHiroWallet();
    }
    if (isExperimentalAnalyticsPage && !isExperimentalAnalyticsPageEnabled) {
      enableExperimentalAnalyticsPage();
    }
  }, [isExperimentalHiroWallet, isExperimentalAnalyticsPage]);

  return (
    <Protected>
      <Home type="drafts" />
    </Protected>
  );
};

export default HomePage;
