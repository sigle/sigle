import { useQuery, UseQueryOptions } from 'react-query';
import { sigleConfig } from '../config';
import {
  AnalyticsHistoricalResponse,
  ReferrersResponse,
} from '../modules/analytics/stats/types';
import { FATHOM_MAX_FROM_DATE } from '../modules/analytics/stats/utils';

export const useGetReferrers = () =>
  useQuery<ReferrersResponse, Error>('get-analytics-referrer', async () => {
    const res = await fetch(
      `${sigleConfig.apiUrl}/api/analytics/referrers?dateFrom=${FATHOM_MAX_FROM_DATE}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const json = await res.json();
    if (!res.ok) {
      throw json;
    }
    return json;
  });

export const useGetHistorical = (
  {
    dateFrom,
    dateGrouping,
  }: {
    dateFrom: string;
    dateGrouping: 'day' | 'month';
  },
  options: UseQueryOptions<AnalyticsHistoricalResponse, Error>
) =>
  useQuery<AnalyticsHistoricalResponse, Error>(
    ['get-analytics-historical', dateFrom, dateGrouping],
    async () => {
      const res = await fetch(
        `${sigleConfig.apiUrl}/api/analytics/historical?dateFrom=${dateFrom}&dateGrouping=${dateGrouping}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw json;
      }
      return json;
    },
    options
  );
