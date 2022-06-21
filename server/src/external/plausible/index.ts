import { config } from '../../config';
import { pages } from './pages';
import { referrers } from './referrers';
import { timeseries } from './timeseries';

export interface PlausibleClientParams {
  apiToken: string;
  siteId: string;
}

export const initPlausibleClient = (clientParams: PlausibleClientParams) => {
  return {
    timeseries: timeseries(clientParams),
    referrers: referrers(clientParams),
    pages: pages(clientParams),
  };
};

export const plausibleClient = initPlausibleClient({
  apiToken: config.PLAUSIBLE_API_TOKEN,
  siteId: config.PLAUSIBLE_SITE_ID,
});
