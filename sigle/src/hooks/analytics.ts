import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AnalyticsService } from '../external/api';

type GetApiAnalyticsReferrersReturnType = Awaited<
  ReturnType<typeof AnalyticsService.analyticsControllerGetReferrers>
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
    () =>
      AnalyticsService.analyticsControllerGetReferrers({ dateFrom, storyId }),
  );

type GetApiAnalyticsHistoricalReturnType = Awaited<
  ReturnType<typeof AnalyticsService.analyticsControllerGetHistorical>
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
  options: UseQueryOptions<GetApiAnalyticsHistoricalReturnType, Error>,
) =>
  useQuery<GetApiAnalyticsHistoricalReturnType, Error>(
    ['get-analytics-historical', dateFrom, dateGrouping, storyId],
    () =>
      AnalyticsService.analyticsControllerGetHistorical({
        dateFrom,
        dateGrouping,
        storyId,
      }),
    options,
  );
