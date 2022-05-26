import { useEffect, useState } from 'react';
import { Box, Flex, Text } from '../../../ui';
import { StatsData } from './types';

interface TotalViewsAndVisitorsProps {
  pageviews: number;
  visits: number;
}

interface StatsTotalProps {
  data: StatsData[];
}

const numberWithCommas = (x: string): string => {
  return new Intl.NumberFormat('en-US').format(Number(x)).toString();
};

export const StatsTotal = ({ data }: StatsTotalProps) => {
  const [totalViewsAndVisitors, setTotalViewsAndVisitors] =
    useState<TotalViewsAndVisitorsProps>();

  useEffect(() => {
    const total = data.reduce(
      function (previousValue, currentValue) {
        return {
          pageviews: previousValue.pageviews + currentValue.pageViews,
          visits: previousValue.visits + currentValue.visits,
        };
      },
      { pageviews: 0, visits: 0 }
    );
    setTotalViewsAndVisitors(total);
  }, [data]);

  return (
    <Flex gap="10" css={{ position: 'absolute' }}>
      <Box>
        <Text css={{ color: '$gray11' }} size="sm">
          Total visitors
        </Text>
        <Text css={{ fontSize: 30, fontWeight: 600, color: '$green11' }}>
          {!totalViewsAndVisitors || totalViewsAndVisitors.visits === 0
            ? '--'
            : numberWithCommas(totalViewsAndVisitors.visits.toString())}
        </Text>
      </Box>
      <Box>
        <Text css={{ color: '$gray11' }} size="sm">
          Total views
        </Text>
        <Text css={{ fontSize: 30, fontWeight: 600, color: '$violet11' }}>
          {!totalViewsAndVisitors || totalViewsAndVisitors.pageviews === 0
            ? '--'
            : numberWithCommas(totalViewsAndVisitors.pageviews.toString())}
        </Text>
      </Box>
    </Flex>
  );
};
