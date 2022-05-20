import { eachDayOfInterval, format } from 'date-fns';
import { useEffect, useState } from 'react';
import { AnalyticsHistoricalResponse, StatsData } from '../../../types';
import {
  Box,
  Flex,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../ui';
import { StatsChart } from './StatsChart';
import { FATHOM_MAX_FROM_DATE } from '../../../pages/api/analytics/utils';

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
    value: 0,
    date: date.toString(),
    visits: 0,
  };
});

export const StatsFrame = () => {
  const [data, setData] = useState<StatsData[]>(initialRange);

  const baseUrl = window.location.origin;

  useEffect(() => {
    fetchWeeklyStats();
  }, []);

  const fetchWeeklyStats = async () => {
    setData(initialRange);

    const statsRes = await fetch(
      `${baseUrl}/api/analytics/historical?dateFrom=${format(
        weekFromDate,
        'yyyy-MM-dd'
      )}&dateGrouping=day`
    );

    const statsData: AnalyticsHistoricalResponse = await statsRes.json();
    const stats: StatsData[] = statsData.historical.map((item) => {
      return {
        value: item.pageviews,
        date: item.date,
        visits: item.visits,
      };
    });

    setData(stats);
  };

  const fetchMonthlyStats = async () => {
    setData(initialRange);

    const statsRes = await fetch(
      `${baseUrl}/api/analytics/historical?dateFrom=${format(
        monthFromDate,
        'yyyy-MM-dd'
      )}&dateGrouping=day`
    );

    const statsData: AnalyticsHistoricalResponse = await statsRes.json();
    const stats: StatsData[] = statsData.historical.map((item) => {
      return {
        value: item.pageviews,
        date: item.date,
        visits: item.visits,
      };
    });
    setData(stats);
  };

  const fetchAllTimeStats = async () => {
    setData(initialRange);

    const statsRes = await fetch(
      `${baseUrl}/api/analytics/historical?dateFrom=${FATHOM_MAX_FROM_DATE}&dateGrouping=month`
    );

    const statsData: AnalyticsHistoricalResponse = await statsRes.json();
    const stats: StatsData[] = statsData.historical.map((item) => {
      return {
        value: item.pageviews,
        date: item.date,
        visits: item.visits,
      };
    });

    setData(stats);
  };

  const fetchStats = (value: string) => {
    switch (value) {
      case 'weekly':
        fetchWeeklyStats();
        break;
      case 'monthly':
        fetchMonthlyStats();
        break;
      case 'all':
        fetchAllTimeStats();
        break;
      default:
        fetchWeeklyStats();
        break;
    }
  };

  return (
    <Box css={{ mb: '$8' }}>
      <Flex>
        <Tabs
          onValueChange={(value) => fetchStats(value)}
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
          <TabsContent value="weekly">
            <Box
              css={{
                mb: '$5',
                position: 'relative',
                width: '100%',
                height: 400,
              }}
            >
              <StatsChart type="week" data={data} />
            </Box>
          </TabsContent>
          <TabsContent value="monthly">
            <Box
              css={{
                mb: '$5',
                position: 'relative',
                width: '100%',
                height: 400,
              }}
            >
              <StatsChart type="month" data={data} />
            </Box>
          </TabsContent>
          <TabsContent value="all">
            <Box
              css={{
                mb: '$5',
                position: 'relative',
                width: '100%',
                height: 400,
              }}
            >
              <StatsChart type="all" data={data} />
            </Box>
          </TabsContent>
        </Tabs>
      </Flex>
    </Box>
  );
};
