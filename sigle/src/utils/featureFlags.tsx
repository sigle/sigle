import { createContext, useContext, useEffect, useState } from 'react';

const experimentalHiroWalletKey = 'sigle-experimental-hiro-wallet';
const experimentalHiroWalletParam = 'experimentalHiroWallet';
const experimentalAnalyticsPageKey = 'sigle-experimental-analytics-page';
const experimentalAnalyticsParam = 'experimentalAnalyticsPage';

interface FeatureFlagsOptions {
  isExperimentalHiroWalletEnabled: boolean;
  isExperimentalAnalyticsPageEnabled: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsOptions>({
  isExperimentalHiroWalletEnabled: false,
  isExperimentalAnalyticsPageEnabled: false,
});

interface FeatureFlagsProviderProps {
  children: React.ReactNode;
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [featureToggles, setFeatureToggles] = useState<FeatureFlagsOptions>({
    isExperimentalHiroWalletEnabled: false,
    isExperimentalAnalyticsPageEnabled: false,
  });

  /**
   * Features flag are injected on mount, as they are stored in local storage it avoids
   * an ssr missmatch.
   */
  useEffect(() => {
    let isExperimentalHiroWalletEnabled =
      localStorage.getItem(experimentalHiroWalletKey) === 'true';
    let isExperimentalAnalyticsPageEnabled =
      localStorage.getItem(experimentalAnalyticsPageKey) === 'true';

    // Enable feature flags from the url params
    const query = new URL(window.location.href).searchParams;
    const entries = Object.fromEntries(new URLSearchParams(query));

    if (entries[experimentalHiroWalletParam] === 'true') {
      localStorage.setItem(experimentalHiroWalletKey, 'true');
      isExperimentalHiroWalletEnabled = true;
    }

    if (entries[experimentalAnalyticsParam] === 'true') {
      localStorage.setItem(experimentalAnalyticsPageKey, 'true');
      isExperimentalAnalyticsPageEnabled = true;
    }

    setFeatureToggles({
      isExperimentalHiroWalletEnabled,
      isExperimentalAnalyticsPageEnabled,
    });
  }, []);

  return (
    <FeatureFlagsContext.Provider value={featureToggles}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
