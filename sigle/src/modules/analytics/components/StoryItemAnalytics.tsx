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
import { SubsetStory } from '../../../types';
import { PublishedStoryItem } from '../PublishedStoryItem';
import { ReferrersFrame } from '../ReferrersFrame';
import { useQuery } from 'react-query';
import { StatsTotal } from '../stats/StatsTotal';
import { StatsError } from '../stats/StatsError';

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

interface StoryAnalyticsProps {
  storyId: string;
  stories: SubsetStory[] | null;
}

export const StoryItemAnalytics = ({
  storyId,
  stories,
}: StoryAnalyticsProps) => {
  const router = useRouter();
  const [statType, setStatType] = useState<StatsType>('weekly');
  const { data, isError, error } = useQuery<StatsData[], Error>(
    ['fetchStoryItemStats', statType],
    () => fetchStats(statType),
    {
      placeholderData: initialRange,
    }
  );

  const story = stories && stories[0];

  // testing on stories that already have views to validate things are working as expected
  const testId = 'JA9dBfdPDp7kQhkFkgPdv';

  const fetchStats = async (statType: string) => {
    const weeklyStatsUrl = `http://localhost:3001/api/analytics/historical?dateFrom=${format(
      weekFromDate,
      'yyyy-MM-dd'
    )}&dateGrouping=day&storyId=${testId}`;

    const monthlyStatsUrl = `http://localhost:3001/api/analytics/historical?dateFrom=${format(
      monthFromDate,
      'yyyy-MM-dd'
    )}&dateGrouping=day&storyId=${testId}`;

    const allTimeStatsUrl = `http://localhost:3001/api/analytics/historical?dateFrom=${FATHOM_MAX_FROM_DATE}&dateGrouping=month&storyId=${testId}`;
    let url;

    switch (statType) {
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
    <DashboardLayout layout="wide">
      {story ? (
        <PublishedStoryItem
          individualStory={true}
          onClick={() => router.push('/analytics')}
          story={story}
        />
      ) : (
        <Box css={{ height: 68 }} />
      )}
      {isError && <StatsError>{error.message}</StatsError>}
      <Flex css={{ mt: '$8' }}>
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
      <ReferrersFrame />
    </DashboardLayout>
  );
};
