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
      pathname: string;
      date: string;
      visits: string;
      pageviews: string;
    }[]
  > => {
    const urlParams = new URLSearchParams({
      period: 'custom',
      date: `${params.dateFrom},${params.dateTo}`,
      property: 'event:page',
      filters: `event:page==${params.paths.join('|')}`,
      metrics: 'visitors,pageviews',
    });

    return plausibleFetch(clientParams)('/stats/breakdown', urlParams);
  };
