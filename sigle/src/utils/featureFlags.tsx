import { createContext, useContext, useEffect, useState } from 'react';

const experimentalAnalyticsPageKey = 'sigle-experimental-analytics-page';
const experimentalAnalyticsParam = 'experimentalAnalyticsPage';
const experimentalFollowKey = 'sigle-experimental-follow';
const experimentalFollowParam = 'experimentalFollow';

interface FeatureFlagsOptions {
  isExperimentalAnalyticsPageEnabled: boolean;
  isExperimentalFollowEnabled: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsOptions>({
  isExperimentalAnalyticsPageEnabled: false,
  isExperimentalFollowEnabled: false,
});

interface FeatureFlagsProviderProps {
  children: React.ReactNode;
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [featureToggles, setFeatureToggles] = useState<FeatureFlagsOptions>({
    isExperimentalAnalyticsPageEnabled: false,
    isExperimentalFollowEnabled: false,
  });

  /**
   * Features flag are injected on mount, as they are stored in local storage it avoids
   * an ssr missmatch.
   */
  useEffect(() => {
    let isExperimentalAnalyticsPageEnabled =
      localStorage.getItem(experimentalAnalyticsPageKey) === 'true';
    let isExperimentalFollowEnabled =
      localStorage.getItem(experimentalFollowKey) === 'true';

    // Enable feature flags from the url params
    const query = new URL(window.location.href).searchParams;
    const entries = Object.fromEntries(new URLSearchParams(query));

    if (entries[experimentalAnalyticsParam] === 'true') {
      localStorage.setItem(experimentalAnalyticsPageKey, 'true');
      isExperimentalAnalyticsPageEnabled = true;
    }
    if (entries[experimentalFollowParam] === 'true') {
      localStorage.setItem(experimentalFollowKey, 'true');
      isExperimentalFollowEnabled = true;
    }

    setFeatureToggles({
      isExperimentalAnalyticsPageEnabled,
      isExperimentalFollowEnabled,
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
