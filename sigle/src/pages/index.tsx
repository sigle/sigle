import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Protected } from '../modules/auth/Protected';
import { Home } from '../modules/home';
import {
  enableExperimentalEditor,
  isExperimentalEditorEnabled,
  enableExperimentalHiroWallet,
  isExperimentalHiroWalletEnabled,
} from '../utils/featureFlags';

const HomePage = () => {
  const router = useRouter();
  const isExperimentalEditor = router.query.experimentalEditor === 'true';
  const isExperimentalHiroWallet =
    router.query.experimentalHiroWallet === 'true';

  useEffect(() => {
    if (isExperimentalEditor && !isExperimentalEditorEnabled) {
      enableExperimentalEditor();
    }
    if (isExperimentalHiroWallet && !isExperimentalHiroWalletEnabled) {
      enableExperimentalHiroWallet();
    }
  }, [isExperimentalEditor]);

  return (
    <Protected>
      <Home type="drafts" />
    </Protected>
  );
};

export default HomePage;
