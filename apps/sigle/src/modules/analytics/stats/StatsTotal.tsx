import { useMemo } from 'react';
import { Box, Flex, Text } from '../../../ui';
import { StatsData } from './types';

interface StatsTotalProps {
  data: StatsData[] | undefined;
}

const numberWithCommas = (x: string): string => {
  return new Intl.NumberFormat('en-US').format(Number(x)).toString();
};

export const StatsTotal = ({ data }: StatsTotalProps) => {
  const totalViewsAndVisitors = useMemo(() => {
    const total = data?.reduce(
      function (previousValue, currentValue) {
        return {
          pageviews: previousValue.pageviews + currentValue.pageviews,
          visits: previousValue.visits + currentValue.visits,
        };
      },
      { pageviews: 0, visits: 0 },
    );
    return total;
  }, [data]);

  return (
    <Flex gap="10" css={{ position: 'absolute' }}>
      <Box>
        <Text css={{ color: '$gray11' }} size="sm">
          Total visitors
        </Text>
        <Text css={{ fontSize: 30, fontWeight: 600, color: '$green11' }}>
          {!totalViewsAndVisitors
            ? '--'
            : numberWithCommas(totalViewsAndVisitors.visits.toString())}
        </Text>
      </Box>
      <Box>
        <Text css={{ color: '$gray11' }} size="sm">
          Total views
        </Text>
        <Text css={{ fontSize: 30, fontWeight: 600, color: '$violet11' }}>
          {!totalViewsAndVisitors
            ? '--'
            : numberWithCommas(totalViewsAndVisitors.pageviews.toString())}
        </Text>
      </Box>
    </Flex>
  );
};
