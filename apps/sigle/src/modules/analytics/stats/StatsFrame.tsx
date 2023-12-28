import { Tabs } from '@radix-ui/themes';
import { useAnalyticsControllerGetHistorical } from '@/__generated__/sigle-api';
import { Box, Flex } from '../../../ui';
import { ErrorMessage } from '../../../ui/ErrorMessage';
import { StatsChart } from './StatsChart';
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
        <Tabs.Root
          onValueChange={(value) => changeHistoricalParams(value as StatsType)}
          defaultValue="weekly"
          className="w-full"
        >
          <Tabs.List
            aria-label="See your total views and visitors"
            className="mb-4 justify-end"
            style={{ boxShadow: 'none' }}
          >
            <Tabs.Trigger value="weekly">Weekly</Tabs.Trigger>
            <Tabs.Trigger value="monthly">Monthly</Tabs.Trigger>
            <Tabs.Trigger value="all">All</Tabs.Trigger>
          </Tabs.List>
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
        </Tabs.Root>
      </Flex>
    </Box>
  );
};
