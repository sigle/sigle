import { NextApiHandler } from 'next';
import * as Sentry from '@sentry/nextjs';
import {
  addDays,
  addMonths,
  differenceInMonths,
  format,
  isBefore,
  isValid,
  parse,
} from 'date-fns';
import { FATHOM_MAX_FROM_DATE, getBucketUrl, getPublicStories } from './utils';
import { fathomClient } from '../../../external/fathom';

interface AnalyticsHistoricalParams {
  dateFrom?: string;
  dateGrouping?: 'day' | 'month';
  storyId?: string;
}

interface AnalyticsHistoricalResponseError {
  error: string;
}

type AnalyticsHistoricalResponse = {
  historical: {
    date: string;
    visits: number;
    pageviews: number;
  }[];
  stories: {
    pathname: string;
    visits: number;
    pageviews: number;
  }[];
};

export const analyticsHistoricalEndpoint: NextApiHandler<
  AnalyticsHistoricalResponseError | AnalyticsHistoricalResponse
> = async (req, res) => {
  const { dateGrouping, storyId } = req.query as AnalyticsHistoricalParams;
  let { dateFrom } = req.query as AnalyticsHistoricalParams;
  const dateTo = new Date();

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

  // Can only request up to 2 month of daily grouping
  if (
    differenceInMonths(dateTo, parsedDateFrom) > 2 &&
    dateGrouping === 'day'
  ) {
    res.status(400).json({
      error: 'dateFrom must be within 2 months when grouping by days',
    });
    return;
  }

  // TODO protect to logged in users
  // TODO take username from session
  const username = 'sigleapp.id.blockstack';

  // Set max date in the past
  if (isBefore(parsedDateFrom, new Date(FATHOM_MAX_FROM_DATE))) {
    dateFrom = FATHOM_MAX_FROM_DATE;
    parsedDateFrom = new Date(FATHOM_MAX_FROM_DATE);
  }

  const historicalResponse: AnalyticsHistoricalResponse = {
    historical: [],
    stories: [],
  };

  // As fathom does not return data for all the days, we need to add the missing days
  // When date grouping is day the date is yyyy-MM-dd
  // When date grouping is month the date is yyyy-MM
  while (isBefore(parsedDateFrom, dateTo)) {
    const date =
      dateGrouping === 'day'
        ? format(parsedDateFrom, 'yyyy-MM-dd')
        : format(parsedDateFrom, 'yyyy-MM');
    historicalResponse.historical.push({
      date,
      visits: 0,
      pageviews: 0,
    });
    parsedDateFrom =
      dateGrouping === 'day'
        ? addDays(parsedDateFrom, 1)
        : addMonths(parsedDateFrom, 1);
  }

  const { profile, bucketUrl } = await getBucketUrl({ req, username });
  if (!profile || !bucketUrl) {
    const errorId = Sentry.captureMessage(
      `No profile or bucketUrl for ${username}`
    );
    res.status(500).json({ error: `Internal server error: ${errorId}` });
    return;
  }

  let storiesPath: string[];
  if (storyId) {
    storiesPath = [`/${username}/${storyId}`];
  } else {
    const publicStoriesFile = await getPublicStories({ bucketUrl });
    storiesPath = publicStoriesFile.map(
      (publicStory) => `/${username}/${publicStory.id}`
    );
    // Add the root path to the list of paths
    storiesPath.push(`/${username}`);
  }

  // TODO batch with max concurrent limit
  const fathomAggregationResult = await Promise.all(
    storiesPath.map((path) =>
      fathomClient.aggregatePath({
        dateFrom,
        dateGrouping,
        path,
      })
    )
  );

  /**
   * Historical aggregated results.
   */

  const datesValues: { [key: string]: { visits: number; pageviews: number } } =
    {};

  // Aggregate the results from fathom and sum the values by date
  fathomAggregationResult.forEach((aggregationResult) => {
    aggregationResult.forEach((result) => {
      if (!datesValues[result.date]) {
        datesValues[result.date] = { visits: 0, pageviews: 0 };
      }
      datesValues[result.date].visits += parseInt(result.visits, 10);
      datesValues[result.date].pageviews += parseInt(result.pageviews, 10);
    });
  });

  Object.keys(datesValues).forEach((date) => {
    const dateValues = datesValues[date];
    const index = historicalResponse.historical.findIndex(
      (historical) => historical.date === date
    );
    if (index === -1) {
      const errorId = Sentry.captureMessage(
        `No index for date ${date} and username ${username}`
      );
      res.status(500).json({ error: `Internal server error: ${errorId}` });
      return;
    }
    historicalResponse.historical[index].visits = dateValues.visits;
    historicalResponse.historical[index].pageviews = dateValues.pageviews;
  });

  /**
   * Stories aggregated results.
   * To limit the calls made to Fathom we reuse the data returned in this API endpoint but ideally
   * once Fathom API is more flexible, this should be moved to it's own endpoint.
   */

  historicalResponse.stories = fathomAggregationResult
    .map((result) => {
      if (result.length === 0) {
        return {
          pathname: '',
          visits: 0,
          pageviews: 0,
        };
      }

      const pathname =
        result[0].pathname === `/${username}`
          ? '/'
          : result[0].pathname.replace(`/${username}/`, '');
      const totalStats = result.reduce(
        (acc, curr) => {
          acc.visits += Number(curr.visits);
          acc.pageviews += Number(curr.pageviews);
          return acc;
        },
        { pathname, visits: 0, pageviews: 0 }
      );
      return {
        pathname,
        visits: totalStats.visits,
        pageviews: totalStats.pageviews,
      };
    })
    .filter((story) => story.pathname !== '');

  res.status(200).json(historicalResponse);
};

export default Sentry.withSentry(analyticsHistoricalEndpoint);
