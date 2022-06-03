import { format } from 'date-fns';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { sigleConfig } from '../../../config';
import { useGetHistorical } from '../../../hooks/analytics';
import { Box, Flex, Tabs, TabsList, TabsTrigger } from '../../../ui';
import { StatsChart } from './StatsChart';
import { StatsError } from './StatsError';
import { StatsTotal } from './StatsTotal';
import { AnalyticsHistoricalResponse, StatsData, StatsType } from './types';
import {
  FATHOM_MAX_FROM_DATE,
  initialRange,
  monthFromDate,
  weekFromDate,
} from './utils';

export const StatsFrame = () => {
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
  } = useGetHistorical(historicalParams, {
    placeholderData: { historical: initialRange, stories: [] },
  });
  const data = historicalData?.historical;

  const checkStatType = (value: StatsType) => {
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
    <Box css={{ mb: '$8', position: 'relative' }}>
      {isError && <StatsError>{error.message}</StatsError>}
      <Flex>
        <StatsTotal data={data} />
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
            <StatsChart type={historicalParams.statType} data={data} />
          </Box>
        </Tabs>
      </Flex>
    </Box>
  );
};
