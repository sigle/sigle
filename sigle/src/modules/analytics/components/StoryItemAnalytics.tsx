import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { StatsChart } from '../stats/StatsChart';
import { StatsType } from '../stats/types';
import { DashboardLayout } from '../../layout';
import {
  Box,
  Flex,
  Tabs,
  TabsList,
  TabsTrigger,
  Typography,
} from '../../../ui';
import { SubsetStory } from '../../../types';
import { PublishedStoryItem } from '../PublishedStoryItem';
import { ReferrersFrame } from '../ReferrersFrame';
import { StatsTotal } from '../stats/StatsTotal';
import { StatsError } from '../stats/StatsError';
import {
  FATHOM_MAX_FROM_DATE,
  initialRange,
  monthFromDate,
  weekFromDate,
} from '../stats/utils';
import { useGetHistorical } from '../../../hooks/analytics';

interface StoryAnalyticsProps {
  story: SubsetStory | undefined;
}

export const StoryItemAnalytics = ({ story }: StoryAnalyticsProps) => {
  const router = useRouter();

  // TODO remove after testing
  if (story) {
    story.id = 'JA9dBfdPDp7kQhkFkgPdv';
  }

  const [historicalParams, setHistoricalParams] = useState<{
    dateFrom: string;
    dateGrouping: 'day' | 'month';
    statType: 'all' | 'weekly' | 'monthly';
  }>(() => ({
    dateFrom: format(weekFromDate, 'yyyy-MM-dd'),
    dateGrouping: 'day',
    statType: 'weekly',
  }));
  const {
    data: historicalData,
    isError,
    error,
  } = useGetHistorical(
    { ...historicalParams, storyId: story?.id },
    {
      placeholderData: { historical: initialRange, stories: [] },
    }
  );
  const data = historicalData?.historical;

  const checkStatType = (value: StatsType) => {
    switch (value) {
      case 'weekly':
        setHistoricalParams({
          dateFrom: format(weekFromDate, 'yyyy-MM-dd'),
          dateGrouping: 'day',
          statType: 'weekly',
        });
      case 'monthly':
        setHistoricalParams({
          dateFrom: format(monthFromDate, 'yyyy-MM-dd'),
          dateGrouping: 'day',
          statType: 'monthly',
        });
        break;
      case 'all':
        setHistoricalParams({
          dateFrom: FATHOM_MAX_FROM_DATE,
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
            <StatsChart type={historicalParams.statType} data={data!} />
          </Box>
        </Tabs>
      </Flex>
      <Flex css={{ mb: '$5' }} justify="between">
        <Typography
          as="h3"
          size="subheading"
          css={{ fontWeight: 600, color: '$gray11' }}
        >
          Referrers
        </Typography>
        <Typography
          as="h3"
          size="subheading"
          css={{ fontWeight: 600, color: '$gray11' }}
        >
          Views
        </Typography>
      </Flex>
      <ReferrersFrame />
    </DashboardLayout>
  );
};
