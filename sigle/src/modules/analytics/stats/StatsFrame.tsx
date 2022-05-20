import { eachDayOfInterval, format } from 'date-fns';
import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '../../../ui';
import { StatsChart } from './StatsChart';
import { FATHOM_MAX_FROM_DATE } from '../../../pages/api/analytics/utils';

interface AnalyticsHistoricalData {
  date: string;
  visits: number;
  pageviews: number;
}

interface AnalyticsStoriesData {
  pathname: string;
  visits: number;
  pageviews: number;
}

type AnalyticsHistoricalResponse = {
  historical: AnalyticsHistoricalData[];
  stories: AnalyticsStoriesData[];
};

interface StatsData {
  pageViews: number;
  date: string;
  visits: number;
}

type StatsType = 'weekly' | 'monthly' | 'all';

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
  const [data, setData] = useState<StatsData[]>(initialRange);
  const [statType, setStatType] = useState<StatsType>('weekly');

  useEffect(() => {
    fetchStats('weekly');
  }, []);

  const fetchStats = async (value: string) => {
    const weeklyStatsUrl = `/api/analytics/historical?dateFrom=${format(
      weekFromDate,
      'yyyy-MM-dd'
    )}&dateGrouping=day`;

    const monthlyStatsUrl = `/api/analytics/historical?dateFrom=${format(
      monthFromDate,
      'yyyy-MM-dd'
    )}&dateGrouping=day`;

    const allTimeStatsUrl = `/api/analytics/historical?dateFrom=${FATHOM_MAX_FROM_DATE}&dateGrouping=month`;
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

    setData(stats);
    setStatType(value);
  };

  return (
    <Box css={{ mb: '$8', position: 'relative' }}>
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
          <TabsContent value="weekly"></TabsContent>
          <Box
            css={{
              mb: '$5',
              position: 'relative',
              width: '100%',
              height: 400,
            }}
          >
            <StatsChart type={statType} data={data} />
          </Box>
        </Tabs>
      </Flex>
    </Box>
  );
};
