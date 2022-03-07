import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Protected } from '../modules/auth/Protected';
import { Home } from '../modules/home';
import {
  enableExperimentalHiroWallet,
  isExperimentalHiroWalletEnabled,
} from '../utils/featureFlags';

const HomePage = () => {
  const router = useRouter();
  const isExperimentalHiroWallet =
    router.query.experimentalHiroWallet === 'true';

  useEffect(() => {
    if (isExperimentalHiroWallet && !isExperimentalHiroWalletEnabled) {
      enableExperimentalHiroWallet();
    }
  }, [isExperimentalHiroWallet]);

  return (
    <Protected>
      <Home type="drafts" />
    </Protected>
  );
};

export default HomePage;
