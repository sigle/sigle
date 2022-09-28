import { isBefore } from 'date-fns';

// All queries should start at this date maximum.
const STATS_MAX_FROM_DATE = '2022-05-01';

/**
 * Set max date in the past. Fathom data is not correct before this one.
 */
export const maxFathomFromDate = (parsedDateFrom: Date, dateFrom: string) => {
  if (isBefore(parsedDateFrom, new Date(STATS_MAX_FROM_DATE))) {
    return STATS_MAX_FROM_DATE;
  }
  return dateFrom;
};
