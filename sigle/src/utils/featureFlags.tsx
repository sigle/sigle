import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Usage: https://app.sigle.io?<nameFeatureFlag>=true
 * Usage example: https://app.sigle.io?experimentalFollow=true
 */

const experimentalFollowKey = 'sigle-experimental-follow';
const experimentalFollowParam = 'experimentalFollow';

interface FeatureFlagsOptions {
  isExperimentalFollowEnabled: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsOptions>({
  isExperimentalFollowEnabled: false,
});

interface FeatureFlagsProviderProps {
  children: React.ReactNode;
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [featureToggles, setFeatureToggles] = useState<FeatureFlagsOptions>({
    isExperimentalFollowEnabled: false,
  });

  /**
   * Features flag are injected on mount, as they are stored in local storage it avoids
   * an ssr missmatch.
   */
  useEffect(() => {
    let isExperimentalFollowEnabled =
      localStorage.getItem(experimentalFollowKey) === 'true';

    // Enable feature flags from the url params
    const query = new URL(window.location.href).searchParams;
    const entries = Object.fromEntries(new URLSearchParams(query));

    if (entries[experimentalFollowParam] === 'true') {
      localStorage.setItem(experimentalFollowKey, 'true');
      isExperimentalFollowEnabled = true;
    }

    setFeatureToggles({
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
