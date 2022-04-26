const experimentalHiroWalletKey = 'sigle-experimental-hiro-wallet';
export let isExperimentalHiroWalletEnabled =
  typeof window === 'undefined'
    ? false
    : localStorage.getItem(experimentalHiroWalletKey) === 'true';
export const enableExperimentalHiroWallet = () => {
  localStorage.setItem(experimentalHiroWalletKey, 'true');
  isExperimentalHiroWalletEnabled = true;
};
