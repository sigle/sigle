const key = 'sigle-experimental-editor';

// When page load, set the flag with the value of the localStorage
export let isExperimentalEditorEnabled =
  typeof window === 'undefined' ? false : localStorage.getItem(key) === 'true';
export const enableExperimentalEditor = () => {
  localStorage.setItem(key, 'true');
  isExperimentalEditorEnabled = true;
};
