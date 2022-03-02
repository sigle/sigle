const experimentalEditorKey = 'sigle-experimental-editor';
export let isExperimentalEditorEnabled =
  typeof window === 'undefined'
    ? false
    : localStorage.getItem(experimentalEditorKey) === 'true';
export const enableExperimentalEditor = () => {
  localStorage.setItem(experimentalEditorKey, 'true');
  isExperimentalEditorEnabled = true;
};

const experimentalHiroWalletKey = 'sigle-experimental-hiro-wallet';
export let isExperimentalHiroWalletEnabled =
  typeof window === 'undefined'
    ? false
    : localStorage.getItem(experimentalHiroWalletKey) === 'true';
export const enableExperimentalHiroWallet = () => {
  localStorage.setItem(experimentalHiroWalletKey, 'true');
  isExperimentalHiroWalletEnabled = true;
};
