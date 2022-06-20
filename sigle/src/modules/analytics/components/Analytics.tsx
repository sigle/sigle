import { useState } from 'react';
import { format } from 'date-fns';
import { SubsetStory } from '../../../types';
import { Box } from '../../../ui';
import { DashboardLayout } from '../../layout';
import { PublishedStoriesFrame } from '../PublishedStoriesFrame';
import { ReferrersFrame } from '../ReferrersFrame';
import { StatsFrame } from '../stats/StatsFrame';
import {
  STATS_MAX_FROM_DATE,
  monthFromDate,
  weekFromDate,
} from '../stats/utils';
import { StatsType } from '../stats/types';

interface AnalyticsProps {
  stories?: SubsetStory[] | null;
  loading: boolean;
}

export const Analytics = ({ stories, loading }: AnalyticsProps) => {
  const [historicalParams, setHistoricalParams] = useState<{
    dateFrom: string;
    dateGrouping: 'day' | 'month';
    statType: 'all' | 'weekly' | 'monthly';
  }>(() => ({
    dateFrom: format(weekFromDate, 'yyyy-MM-dd'),
    dateGrouping: 'day',
    statType: 'weekly',
  }));

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
      <StatsFrame
        historicalParams={historicalParams}
        changeHistoricalParams={changeHistoricalParams}
      />
      <Box
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: '$10',
          '@xl': {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
          },
        }}
      >
        {stories && (
          <PublishedStoriesFrame
            historicalParams={historicalParams}
            loading={loading}
            stories={stories}
          />
        )}
        <ReferrersFrame historicalParams={historicalParams} />
      </Box>
    </DashboardLayout>
  );
};
