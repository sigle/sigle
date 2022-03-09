const experimentalHiroWalletKey = 'sigle-experimental-hiro-wallet';
export let isExperimentalHiroWalletEnabled =
  typeof window === 'undefined'
    ? false
    : localStorage.getItem(experimentalHiroWalletKey) === 'true';
export const enableExperimentalHiroWallet = () => {
  localStorage.setItem(experimentalHiroWalletKey, 'true');
  isExperimentalHiroWalletEnabled = true;
};

const experimentalThemeToggleKey = 'sigle-experimental-theme-toggle';
export let isExperimentalThemeToggleEnabled =
  typeof window === 'undefined'
    ? false
    : localStorage.getItem(experimentalThemeToggleKey) === 'true';

export const enableExperimentalThemeToggle = () => {
  localStorage.setItem(experimentalThemeToggleKey, 'true');
  isExperimentalThemeToggleEnabled = true;
};
