import { eachDayOfInterval } from 'date-fns';
import { StatsData } from './types';

export const STATS_MAX_FROM_DATE = '2022-05-01';

// prevent flash of no content in graph by initializing range data with a constant value (1)
export const today = new Date();
export const weekFromDate = new Date(new Date().setDate(today.getDate() - 7));
export const monthFromDate = new Date(new Date().setDate(today.getDate() - 30));

export const dates = eachDayOfInterval({
  start: weekFromDate,
  end: today,
});

export const initialRange: StatsData[] = dates.map((date) => {
  return {
    pageviews: 0,
    date: date.toString(),
    visits: 0,
  };
});
