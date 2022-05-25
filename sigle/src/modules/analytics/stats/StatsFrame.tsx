import { eachDayOfInterval, format } from 'date-fns';
import { useEffect, useState } from 'react';
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
import { StatsTotal } from './StatsTotal';
import { AnalyticsHistoricalResponse, StatsData, StatsType } from './types';

const FATHOM_MAX_FROM_DATE = '2021-04-01';

// prevent flash of no content in graph by initializing range data with a constant value (1)
const today = new Date();
const weekFromDate = new Date(new Date().setDate(today.getDate() - 7));
const monthFromDate = new Date(new Date().setDate(today.getDate() - 30));

const dates = eachDayOfInterval({
  start: weekFromDate,
  end: today,
});

const initialRange: StatsData[] = dates.map((date) => {
  return {
    pageViews: 0,
    date: date.toString(),
    visits: 0,
  };
});

export const StatsFrame = () => {
  const [statType, setStatType] = useState<StatsType>('weekly');
  const { data, refetch } = useQuery('fetchStats', () => fetchStats(statType), {
    select: (data: AnalyticsHistoricalResponse) => {
      const statsData = data?.historical.map((item) => {
        return {
          pageViews: item.pageviews,
          date: item.date,
          visits: item.visits,
        };
      });
      return statsData;
    },
  });

  useEffect(() => {
    refetch();
  }, [statType]);

  const fetchStats = async (value: string) => {
    const weeklyStatsUrl = `http://localhost:3001/api/analytics/historical?dateFrom=${format(
      weekFromDate,
      'yyyy-MM-dd'
    )}&dateGrouping=day`;

    const monthlyStatsUrl = `http://localhost:3001/api/analytics/historical?dateFrom=${format(
      monthFromDate,
      'yyyy-MM-dd'
    )}&dateGrouping=day`;

    const allTimeStatsUrl = `http://localhost:3001/api/analytics/historical?dateFrom=${FATHOM_MAX_FROM_DATE}&dateGrouping=month`;
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

    return fetch(url).then((res) => res.json());
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
      <Flex>
        <StatsTotal data={data} />
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
          {data ? (
            <Box
              css={{
                mb: '$8',
                position: 'relative',
                width: '100%',
                height: 400,
              }}
            >
              <StatsChart type={statType} data={data} />
            </Box>
          ) : (
            <Box
              css={{
                height: 400,
              }}
            />
          )}
        </Tabs>
      </Flex>
    </Box>
  );
};
