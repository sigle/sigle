import { NextApiHandler } from 'next';
import * as Sentry from '@sentry/nextjs';
import { format, isValid, parse } from 'date-fns';

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
  const parsedDate = parse(dateFrom, 'yyyy-MM-dd', new Date());
  const isValidDate = isValid(parsedDate);
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

  res.status(200).json([]);
};

export default Sentry.withSentry(analyticsHistoricalEndpoint);
