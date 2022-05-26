import { format } from 'date-fns';
import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Flex,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../ui';
import { StatsChart } from './StatsChart';
import { StatsError } from './StatsError';
import { StatsTotal } from './StatsTotal';
import { AnalyticsHistoricalResponse, StatsData, StatsType } from './types';
import {
  baseUrl,
  FATHOM_MAX_FROM_DATE,
  initialRange,
  monthFromDate,
  weekFromDate,
} from './utils';

export const StatsFrame = () => {
  const [statType, setStatType] = useState<StatsType>('weekly');
  const { data, isError, error } = useQuery<StatsData[], Error>(
    ['fetchStats', statType],
    () => fetchStats(statType),
    {
      placeholderData: initialRange,
    }
  );

  const fetchStats = async (value: string) => {
    const weeklyStatsUrl = `${baseUrl}/api/analytics/historical?dateFrom=${format(
      weekFromDate,
      'yyyy-MM-dd'
    )}&dateGrouping=day`;

    const monthlyStatsUrl = `${baseUrl}/api/analytics/historical?dateFrom=${format(
      monthFromDate,
      'yyyy-MM-dd'
    )}&dateGrouping=day`;

    const allTimeStatsUrl = `${baseUrl}/api/analytics/historical?dateFrom=${FATHOM_MAX_FROM_DATE}&dateGrouping=month`;
    let url;

    switch (value) {
      case 'weekly':
        url = weeklyStatsUrl;
        break;
      case 'monthly':
        url = monthlyStatsUrl;
        break;
      case 'all':
        url = allTimeStatsUrl;
        break;

      default:
        throw new Error('No value received.');
    }

    const statsRes = await fetch(url);
    const statsData: AnalyticsHistoricalResponse = await statsRes.json();
    const stats: StatsData[] = statsData.historical.map((item) => {
      return {
        pageViews: item.pageviews,
        date: item.date,
        visits: item.visits,
      };
    });
    return stats;
  };

  const checkStatType = (value: string) => {
    switch (value) {
      case 'weekly':
        setStatType('weekly');
        break;
      case 'monthly':
        setStatType('monthly');
        break;
      case 'all':
        setStatType('all');
        break;
      default:
        throw new Error('No value received.');
    }
  };

  return (
    <Box css={{ mb: '$8', position: 'relative' }}>
      {isError && <StatsError>{error.message}</StatsError>}
      <Flex>
        <StatsTotal data={data!} />
        <Tabs
          onValueChange={(value) => checkStatType(value)}
          css={{ width: '100%' }}
          defaultValue="weekly"
        >
          <TabsList
            css={{ alignSelf: 'end' }}
            aria-label="See your total views and visitors"
          >
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly"></TabsContent>
          <Box
            css={{
              mb: '$8',
              position: 'relative',
              width: '100%',
              height: 400,
            }}
          >
            <StatsChart type={statType} data={data!} />
          </Box>
        </Tabs>
      </Flex>
    </Box>
  );
};
