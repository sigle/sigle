import { NextApiHandler } from 'next';
import * as Sentry from '@sentry/nextjs';
import { isBefore, isValid, parse } from 'date-fns';
import { FATHOM_MAX_FROM_DATE, getBucketUrl, getPublicStories } from './utils';
import { fathomClient } from '../../../external/fathom';

interface AnalyticsReferrersParams {
  dateFrom?: string;
  storyId?: string;
}

interface AnalyticsReferrersResponseError {
  error: string;
}

type AnalyticsReferrersResponse = {
  domain: string | null;
  count: number;
}[];

export const analyticsReferrersEndpoint: NextApiHandler<
  AnalyticsReferrersResponseError | AnalyticsReferrersResponse
> = async (req, res) => {
  const { storyId } = req.query as AnalyticsReferrersParams;
  let { dateFrom } = req.query as AnalyticsReferrersParams;

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

  // TODO protect to logged in users
  // TODO take username from session
  const username = 'sigleapp.id.blockstack';

  // Set max date in the past
  if (isBefore(parsedDateFrom, new Date(FATHOM_MAX_FROM_DATE))) {
    dateFrom = FATHOM_MAX_FROM_DATE;
    parsedDateFrom = new Date(FATHOM_MAX_FROM_DATE);
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
      fathomClient.aggregateReferrers({
        dateFrom,
        path,
      })
    )
  );

  const domainsValues: { [key: string]: { count: number } } = {};

  fathomAggregationResult.forEach((aggregationResult) => {
    aggregationResult.forEach((result) => {
      if (!domainsValues[result.referrer_hostname]) {
        domainsValues[result.referrer_hostname] = { count: 0 };
      }
      domainsValues[result.referrer_hostname].count += parseInt(
        result.uniques,
        10
      );
    });
  });

  const referrersResponse: AnalyticsReferrersResponse = Object.keys(
    domainsValues
  )
    .map((domain) => {
      const domainValues = domainsValues[domain];
      return { domain, count: domainValues.count };
    })
    .sort((a, b) => b.count - a.count);

  res.status(200).json(referrersResponse);
};

export default Sentry.withSentry(analyticsReferrersEndpoint);
