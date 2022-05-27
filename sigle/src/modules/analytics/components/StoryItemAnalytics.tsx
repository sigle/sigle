import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { StatsChart } from '../stats/StatsChart';
import {
  AnalyticsHistoricalResponse,
  StatsData,
  StatsType,
} from '../stats/types';
import { DashboardLayout } from '../../layout';
import { Box, Flex, Tabs, TabsList, TabsTrigger } from '../../../ui';
import { SubsetStory } from '../../../types';
import { PublishedStoryItem } from '../PublishedStoryItem';
import { ReferrersFrame } from '../ReferrersFrame';
import { useQuery } from 'react-query';
import { StatsTotal } from '../stats/StatsTotal';
import { StatsError } from '../stats/StatsError';
import {
  baseUrl,
  FATHOM_MAX_FROM_DATE,
  initialRange,
  monthFromDate,
  weekFromDate,
} from '../stats/utils';

interface StoryAnalyticsProps {
  story: SubsetStory | undefined;
}

export const StoryItemAnalytics = ({ story }: StoryAnalyticsProps) => {
  const router = useRouter();
  const [statType, setStatType] = useState<StatsType>('weekly');
  const { data, isError, error } = useQuery<StatsData[], Error>(
    ['fetchStats', statType],
    () => fetchStats(statType),
    {
      placeholderData: initialRange,
    }
  );

  // testing on stories that already have views to validate things are working as expected
  const testId = 'JA9dBfdPDp7kQhkFkgPdv';

  const fetchStats = async (statType: StatsType) => {
    const weeklyStatsUrl = `${baseUrl}/api/analytics/historical?dateFrom=${format(
      weekFromDate,
      'yyyy-MM-dd'
    )}&dateGrouping=day&storyId=${testId}`;

    const monthlyStatsUrl = `${baseUrl}/api/analytics/historical?dateFrom=${format(
      monthFromDate,
      'yyyy-MM-dd'
    )}&dateGrouping=day&storyId=${testId}`;

    const allTimeStatsUrl = `${baseUrl}/api/analytics/historical?dateFrom=${FATHOM_MAX_FROM_DATE}&dateGrouping=month&storyId=${testId}`;
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

    if (!statsRes.ok) {
      throw new Error(`Error: ${statsRes.status} - ${statsRes.statusText}`);
    }

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

  const checkStatType = (value: StatsType) => {
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
          onValueChange={(value) => checkStatType(value as StatsType)}
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
