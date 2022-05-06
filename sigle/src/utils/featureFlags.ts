const experimentalHiroWalletKey = 'sigle-experimental-hiro-wallet';
export let isExperimentalHiroWalletEnabled =
  typeof window === 'undefined'
    ? false
    : localStorage.getItem(experimentalHiroWalletKey) === 'true';
export const enableExperimentalHiroWallet = () => {
  localStorage.setItem(experimentalHiroWalletKey, 'true');
  isExperimentalHiroWalletEnabled = true;
};

const experimentalAnalyticsPageKey = 'sigle-experimental-analytics-page';
export let isExperimentalAnalyticsPageEnabled =
  typeof window === 'undefined'
    ? false
    : localStorage.getItem(experimentalAnalyticsPageKey) === 'true';
export const enableExperimentalAnalyticsPage = () => {
  localStorage.setItem(experimentalAnalyticsPageKey, 'true');
  isExperimentalAnalyticsPageEnabled = true;
};
