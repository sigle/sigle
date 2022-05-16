import { eachDayOfInterval } from 'date-fns';
import { useEffect, useState } from 'react';
import { AnalyticsHistoricalResponse, StatsData } from '../../../types';
import { Box } from '../../../ui';
import { AreaChart } from './AreaChart';

// prevent flash of no content in graph by initializing range data with a constant value (1)
const today = new Date();
const fromDate = new Date(new Date().setDate(today.getDate() - 7));

const dates = eachDayOfInterval({
  start: fromDate,
  end: today,
});

const initialRange: StatsData[] = dates.map((date) => {
  return {
    value: 1,
    date: date.toString(),
  };
});

export const StatsAll = () => {
  const [viewData, setViewData] = useState<StatsData[]>(initialRange);
  const [visitData, setVisitData] = useState<StatsData[]>(initialRange);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const baseUrl = window.location.origin;

    const statsRes = await fetch(
      `${baseUrl}/api/analytics/historical?dateFrom=2019-05-13&dateGrouping=month`
    );
    const statsData: AnalyticsHistoricalResponse = await statsRes.json();

    const views: StatsData[] = statsData.historical.map((item) => {
      return {
        value: item.pageviews,
        date: item.date,
      };
    });

    const visits: StatsData[] = statsData.historical.map((item) => {
      return {
        value: item.visits,
        date: item.date,
      };
    });

    setViewData(views);
    setVisitData(visits);
  };

  return (
    <Box
      css={{
        mb: '$5',
        position: 'relative',
        width: '100%',
        height: 400,
      }}
    >
      <Box
        css={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          zIndex: 1,
        }}
      >
        <AreaChart data={viewData} color="purple" />
      </Box>
      <Box
        css={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
        }}
      >
        <AreaChart data={visitData} color="green" />
      </Box>
    </Box>
  );
};
