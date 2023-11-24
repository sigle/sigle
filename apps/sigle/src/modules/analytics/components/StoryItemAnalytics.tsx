import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAnalyticsControllerGetHistorical } from '@/__generated__/sigle-api';
import { StatsChart } from '../stats/StatsChart';
import { StatsType } from '../stats/types';
import { DashboardLayout } from '../../layout';
import { Box, Flex, Tabs, TabsList, TabsTrigger } from '../../../ui';
import { SubsetStory } from '../../../types';
import { PublishedStoryItem } from '../PublishedStoryItem';
import { ReferrersFrame } from '../ReferrersFrame';
import { StatsTotal } from '../stats/StatsTotal';
import { ErrorMessage } from '../../../ui/ErrorMessage';
import {
  STATS_MAX_FROM_DATE,
  initialRange,
  monthFromDate,
  weekFromDate,
} from '../stats/utils';

interface StoryAnalyticsProps {
  story: SubsetStory | undefined;
}

export const StoryItemAnalytics = ({ story }: StoryAnalyticsProps) => {
  const router = useRouter();

  const [historicalParams, setHistoricalParams] = useState<{
    dateFrom: string;
    dateGrouping: 'day' | 'month';
    statType: 'all' | 'weekly' | 'monthly';
  }>(() => ({
    dateFrom: format(weekFromDate, 'yyyy-MM-dd'),
    dateGrouping: 'day',
    statType: 'weekly',
  }));
  const { data: historicalData, error } = useAnalyticsControllerGetHistorical(
    {
      queryParams: {
        ...historicalParams,
        storyId: story?.id,
      },
    },
    {
      placeholderData: { historical: initialRange, stories: [] },
    },
  );
  const data = historicalData?.historical;

  const changeHistoricalParams = (value: StatsType) => {
    switch (value) {
      case 'weekly':
        setHistoricalParams({
          dateFrom: format(weekFromDate, 'yyyy-MM-dd'),
          dateGrouping: 'day',
          statType: 'weekly',
        });
        break;
      case 'monthly':
        setHistoricalParams({
          dateFrom: format(monthFromDate, 'yyyy-MM-dd'),
          dateGrouping: 'day',
          statType: 'monthly',
        });
        break;
      case 'all':
        setHistoricalParams({
          dateFrom: STATS_MAX_FROM_DATE,
          dateGrouping: 'month',
          statType: 'all',
        });
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
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
      <Flex css={{ mt: '$8' }}>
        <StatsTotal data={data!} />
        <Tabs
          onValueChange={(value) => changeHistoricalParams(value as StatsType)}
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
            <StatsChart type={historicalParams.statType} data={data!} />
          </Box>
        </Tabs>
      </Flex>
      <ReferrersFrame storyId={story?.id} historicalParams={historicalParams} />
    </DashboardLayout>
  );
};
