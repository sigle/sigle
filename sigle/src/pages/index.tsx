import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Protected } from '../modules/auth/Protected';
import { Home } from '../modules/home';
import {
  enableExperimentalHiroWallet,
  isExperimentalHiroWalletEnabled,
  isExperimentalThemeToggleEnabled,
  enableExperimentalThemeToggle,
} from '../utils/featureFlags';

const HomePage = () => {
  const router = useRouter();
  const isExperimentalHiroWallet =
    router.query.experimentalHiroWallet === 'true';
  const isExperimentalThemeToggle =
    router.query.experimentalThemeToggle === 'true';

  useEffect(() => {
    if (isExperimentalHiroWallet && !isExperimentalHiroWalletEnabled) {
      enableExperimentalHiroWallet();
    }
    if (isExperimentalThemeToggle && !isExperimentalThemeToggleEnabled) {
      enableExperimentalThemeToggle();
    }
  }, [isExperimentalHiroWallet, isExperimentalThemeToggle]);

  return (
    <Protected>
      <Home type="drafts" />
    </Protected>
  );
};

export default HomePage;
