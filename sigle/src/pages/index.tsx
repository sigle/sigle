import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Protected } from '../modules/auth/Protected';
import { Home } from '../modules/home';
import {
  enableExperimentalEditor,
  isExperimentalEditorEnabled,
  enableExperimentalHiroWallet,
  isExperimentalHiroWalletEnabled,
  isExperimentalThemeToggleEnabled,
  enableExperimentalThemeToggle,
} from '../utils/featureFlags';

const HomePage = () => {
  const router = useRouter();
  const isExperimentalEditor = router.query.experimentalEditor === 'true';
  const isExperimentalHiroWallet =
    router.query.experimentalHiroWallet === 'true';
  const isExperimentalThemeToggle =
    router.query.experimentalThemeToggle === 'true';

  useEffect(() => {
    if (isExperimentalEditor && !isExperimentalEditorEnabled) {
      enableExperimentalEditor();
    }
    if (isExperimentalHiroWallet && !isExperimentalHiroWalletEnabled) {
      enableExperimentalHiroWallet();
    }
    if (isExperimentalThemeToggle && !isExperimentalThemeToggleEnabled) {
      enableExperimentalThemeToggle();
    }
  }, [isExperimentalEditor]);

  return (
    <Protected>
      <Home type="drafts" />
    </Protected>
  );
};

export default HomePage;
