import { PlausibleClientParams } from '.';
import { plausibleFetch } from './fetch';

export const pages =
  (clientParams: PlausibleClientParams) =>
  async (params: {
    dateFrom: string;
    dateTo: string;
    paths: string[];
  }): Promise<
    {
      page: string;
      pageviews: number;
      visitors: number;
    }[]
  > => {
    const urlParams = new URLSearchParams({
      period: 'custom',
      date: `${params.dateFrom},${params.dateTo}`,
      property: 'event:page',
      filters: `event:page==${params.paths.join('|')}`,
      metrics: 'visitors,pageviews',
    });

    const data = await plausibleFetch(clientParams)(
      '/stats/breakdown',
      urlParams
    );
    return data.results;
  };
