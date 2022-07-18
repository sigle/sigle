import { useQuery, UseQueryOptions } from 'react-query';
import { AnalyticsService } from '../external/api';

type GetApiAnalyticsReferrersReturnType = Awaited<
  ReturnType<typeof AnalyticsService.getApiAnalyticsReferrers>
>;
export const useGetReferrers = ({
  dateFrom,
  storyId,
}: {
  dateFrom: string;
  storyId?: string;
}) =>
  useQuery<GetApiAnalyticsReferrersReturnType, Error>(
    ['get-analytics-referrer', dateFrom, storyId],
    () => AnalyticsService.getApiAnalyticsReferrers({ dateFrom, storyId })
  );

type GetApiAnalyticsHistoricalReturnType = Awaited<
  ReturnType<typeof AnalyticsService.getApiAnalyticsHistorical>
>;
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
  options: UseQueryOptions<GetApiAnalyticsHistoricalReturnType, Error>
) =>
  useQuery<GetApiAnalyticsHistoricalReturnType, Error>(
    ['get-analytics-historical', dateFrom, dateGrouping, storyId],
    () =>
      AnalyticsService.getApiAnalyticsHistorical({
        dateFrom,
        dateGrouping,
        storyId,
      }),
    options
  );
