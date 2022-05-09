const experimentalAnalyticsPageKey = 'sigle-experimental-analytics-page';
export let isExperimentalAnalyticsPageEnabled =
  typeof window === 'undefined'
    ? false
    : localStorage.getItem(experimentalAnalyticsPageKey) === 'true';
export const enableExperimentalAnalyticsPage = () => {
  localStorage.setItem(experimentalAnalyticsPageKey, 'true');
  isExperimentalAnalyticsPageEnabled = true;
};
