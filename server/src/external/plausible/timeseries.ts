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
      date: string;
      pageviews: number;
      visitors: number;
    }[]
  > => {
    const urlParams = new URLSearchParams({
      period: 'custom',
      interval: params.dateGrouping === 'day' ? 'date' : 'month',
      date: `${params.dateFrom},${params.dateTo}`,
      filters: `event:page==${params.paths.join('|')}`,
      metrics: 'visitors,pageviews',
    });

    const data = await plausibleFetch(clientParams)(
      '/stats/timeseries',
      urlParams
    );
    return data.results;
  };
