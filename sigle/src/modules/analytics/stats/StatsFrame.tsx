import { useAnalyticsControllerGetHistorical } from '@/__generated__/sigle-api';
import { Box, Flex, Tabs, TabsList, TabsTrigger } from '../../../ui';
import { StatsChart } from './StatsChart';
import { ErrorMessage } from '../../../ui/ErrorMessage';
import { StatsTotal } from './StatsTotal';
import { StatsType } from './types';
import { initialRange } from './utils';

interface StatsFrameProps {
  historicalParams: {
    dateFrom: string;
    dateGrouping: 'day' | 'month';
    statType: 'all' | 'weekly' | 'monthly';
  };
  changeHistoricalParams(value: StatsType): void;
}

export const StatsFrame = ({
  historicalParams,
  changeHistoricalParams,
}: StatsFrameProps) => {
  const { data: historicalData, error } = useAnalyticsControllerGetHistorical(
    {
      queryParams: historicalParams,
    },
    {
      placeholderData: { historical: initialRange, stories: [] },
    },
  );
  const data = historicalData?.historical;

  return (
    <Box css={{ mb: '$8', position: 'relative' }}>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
      <Flex>
        <StatsTotal data={data} />
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
            <StatsChart type={historicalParams.statType} data={data} />
          </Box>
        </Tabs>
      </Flex>
    </Box>
  );
};
