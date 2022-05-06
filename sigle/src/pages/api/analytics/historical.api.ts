import { NextApiHandler } from 'next';
import * as Sentry from '@sentry/nextjs';
import { addDays, format, isBefore, isValid, parse } from 'date-fns';
import { getBucketUrl } from './utils';

interface AnalyticsHistoricalParams {
  dateFrom?: string;
  dateGrouping?: 'day' | 'month';
}

interface AnalyticsHistoricalResponseError {
  error: string;
}

type AnalyticsHistoricalResponse = {
  date: string;
  visits: number;
  pageviews: number;
}[];

// TODO not more than const dateFrom = '2021-04-01';

export const analyticsHistoricalEndpoint: NextApiHandler<
  AnalyticsHistoricalResponseError | AnalyticsHistoricalResponse
> = async (req, res) => {
  let { dateFrom, dateGrouping } = req.query as AnalyticsHistoricalParams;

  if (!dateFrom) {
    res.status(400).json({ error: 'dateFrom is required' });
    return;
  }
  let parsedDateFrom = parse(dateFrom, 'yyyy-MM-dd', new Date());
  const isValidDate = isValid(parsedDateFrom);
  if (!isValidDate) {
    res.status(400).json({ error: 'dateFrom is invalid' });
    return;
  }

  if (!dateGrouping) {
    res.status(400).json({ error: 'dateGrouping is required' });
    return;
  }
  if (dateGrouping !== 'day' && dateGrouping !== 'month') {
    res.status(400).json({ error: 'dateGrouping must be day or month' });
    return;
  }

  // TODO protect to logged in users
  // TODO take username from session
  const username = 'sigleapp.id.blockstack';
  // TODO test what is happening with a date in the future
  const dateTo = new Date();

  const historicalResponse: AnalyticsHistoricalResponse = [];

  // As fathom does not return data for all the days, we need to add the missing days
  while (isBefore(parsedDateFrom, dateTo)) {
    const date = format(parsedDateFrom, 'yyyy-MM-dd');
    historicalResponse.push({
      date,
      visits: 0,
      pageviews: 0,
    });
    parsedDateFrom = addDays(parsedDateFrom, 1);
  }

  const { profile, bucketUrl } = await getBucketUrl({ req, username });
  if (!profile || !bucketUrl) {
    // TODO as this should never happen, report it to Sentry
    res.status(500).json({ error: 'user not found' });
    return;
  }

  res.status(200).json(historicalResponse);
};

export default Sentry.withSentry(analyticsHistoricalEndpoint);
