import { PlausibleClientParams } from '.';
import { plausibleFetch } from './fetch';

export const timeseries =
  (clientParams: PlausibleClientParams) =>
  async (params: {
    dateGrouping: 'day' | 'month';
    dateFrom: string;
    dateTo: string;
    paths: string[];
  }): Promise<
    {
      pathname: string;
      date: string;
      visits: string;
      pageviews: string;
    }[]
  > => {
    const urlParams = new URLSearchParams({
      period: 'custom',
      interval: params.dateGrouping === 'day' ? 'date' : 'month',
      date: `${params.dateFrom},${params.dateTo}`,
      filters: `event:page==${params.paths.join('|')}`,
      metrics: 'visitors,pageviews',
    });

    return plausibleFetch(clientParams)('/stats/timeseries', urlParams);
  };
