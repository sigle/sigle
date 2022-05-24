import { eachDayOfInterval, format } from 'date-fns';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { StatsChart } from '../stats/StatsChart';
import {
  AnalyticsHistoricalResponse,
  StatsData,
  StatsType,
} from '../stats/types';
import { DashboardLayout } from '../../layout';
import {
  Box,
  Flex,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '../../../ui';
import { FATHOM_MAX_FROM_DATE } from '../../../pages/api/analytics/utils';
import { SubsetStory } from '../../../types';
import { PublishedStoryItem } from '../PublishedStoryItem';

const numberWithCommas = (x: string): string => {
  return new Intl.NumberFormat('en-US').format(Number(x)).toString();
};

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

interface TotalViewsAndVisitorsProps {
  pageviews: number;
  visits: number;
}

interface StoryAnalyticsPProps {
  storyId: string;
  stories: SubsetStory[] | null;
}

export const StoryItemAnalytics = ({
  storyId,
  stories,
}: StoryAnalyticsPProps) => {
  const router = useRouter();
  const [data, setData] = useState<StatsData[]>(initialRange);
  const [statType, setStatType] = useState<StatsType>('weekly');
  const [totalViewsAndVisitors, setTotalViewsAndVisitors] =
    useState<TotalViewsAndVisitorsProps>();

  const story = stories && stories[0];

  useEffect(() => {
    fetchStats('weekly');
  }, []);

  // testing on stories that already have views to validate things are working as expected
  const testId = 'JA9dBfdPDp7kQhkFkgPdv';

  const fetchStats = async (value: string) => {
    const weeklyStatsUrl = `/api/analytics/historical?dateFrom=${format(
      weekFromDate,
      'yyyy-MM-dd'
    )}&dateGrouping=day&storyId=${testId}`;

    const monthlyStatsUrl = `/api/analytics/historical?dateFrom=${format(
      monthFromDate,
      'yyyy-MM-dd'
    )}&dateGrouping=day&storyId=${testId}`;

    const allTimeStatsUrl = `/api/analytics/historical?dateFrom=${FATHOM_MAX_FROM_DATE}&dateGrouping=month&storyId=${testId}`;
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
    console.log(statsData);
    const stats: StatsData[] = statsData.historical.map((item) => {
      return {
        pageViews: item.pageviews,
        date: item.date,
        visits: item.visits,
      };
    });

    const viewTotal = statsData.historical.reduce(
      function (previousValue, currentValue) {
        return {
          pageviews: previousValue.pageviews + currentValue.pageviews,
          visits: previousValue.visits + currentValue.visits,
        };
      },
      { pageviews: 0, visits: 0 }
    );

    setData(stats);
    setStatType(value);
    setTotalViewsAndVisitors(viewTotal);
  };

  return (
    <DashboardLayout layout="wide">
      {story ? (
        <PublishedStoryItem
          arrowPlacement="left"
          onClick={() => router.push('/analytics')}
          story={story}
        />
      ) : (
        <Box css={{ height: 68 }} />
      )}
      <Flex css={{ mt: '$8' }}>
        <Flex gap="10" css={{ position: 'absolute' }}>
          <Box>
            <Text css={{ color: '$gray11' }} size="sm">
              Total visitors
            </Text>
            <Text css={{ fontSize: 30, fontWeight: 600, color: '$green11' }}>
              {totalViewsAndVisitors
                ? numberWithCommas(totalViewsAndVisitors.visits.toString())
                : '--'}
            </Text>
          </Box>
          <Box>
            <Text css={{ color: '$gray11' }} size="sm">
              Total views
            </Text>
            <Text css={{ fontSize: 30, fontWeight: 600, color: '$violet11' }}>
              {totalViewsAndVisitors
                ? numberWithCommas(totalViewsAndVisitors.pageviews.toString())
                : '--'}
            </Text>
          </Box>
        </Flex>
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
        </Tabs>
      </Flex>
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
    </DashboardLayout>
  );
};
