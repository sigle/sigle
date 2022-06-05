import { useQuery, UseQueryOptions } from 'react-query';
import { sigleConfig } from '../config';
import {
  AnalyticsHistoricalResponse,
  ReferrersResponse,
} from '../modules/analytics/stats/types';

export const useGetReferrers = ({ dateFrom }: { dateFrom: string }) =>
  useQuery<ReferrersResponse, Error>(
    ['get-analytics-referrer', dateFrom],
    async () => {
      const res = await fetch(
        `${sigleConfig.apiUrl}/api/analytics/referrers?dateFrom=${dateFrom}`,
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
    }
  );

export const useGetHistorical = (
  {
    dateFrom,
    dateGrouping,
    storyId,
  }: {
    dateFrom: string;
    dateGrouping: 'day' | 'month';
    storyId?: string;
  },
  options: UseQueryOptions<AnalyticsHistoricalResponse, Error>
) =>
  useQuery<AnalyticsHistoricalResponse, Error>(
    ['get-analytics-historical', dateFrom, dateGrouping, storyId],
    async () => {
      const res = await fetch(
        storyId
          ? `${sigleConfig.apiUrl}/api/analytics/historical?dateFrom=${dateFrom}&dateGrouping=${dateGrouping}&storyId=${storyId}`
          : `${sigleConfig.apiUrl}/api/analytics/historical?dateFrom=${dateFrom}&dateGrouping=${dateGrouping}`,
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
