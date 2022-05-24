import { FastifyInstance } from 'fastify';
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

export async function createAnalyticsReferrersEndpoint(
  fastify: FastifyInstance
) {
  return fastify.get(
    '/api/analytics/referrers',
    // TODO schema validation https://www.fastify.io/docs/latest/Reference/Validation-and-Serialization/
    // TODO serialize response https://www.fastify.io/docs/latest/Guides/Getting-Started/#serialize-your-data
    async (req, res) => {
      console.log('/api/analytics/referrers cqlled');
      const { storyId } = req.query as AnalyticsReferrersParams;
      let { dateFrom } = req.query as AnalyticsReferrersParams;

      if (!dateFrom) {
        res.status(400).send({ error: 'dateFrom is required' });
        return;
      }
      let parsedDateFrom = parse(dateFrom, 'yyyy-MM-dd', new Date());
      const isValidDate = isValid(parsedDateFrom);
      if (!isValidDate) {
        res.status(400).send({ error: 'dateFrom is invalid' });
        return;
      }

      // TODO protect to logged in users
      // TODO take username from session
      const username = 'sigleapp.id.blockstack';

      // Set max date in the past
      // TODO this could be moved as an analytics utils so it can be reused in other endpoints
      if (isBefore(parsedDateFrom, new Date(FATHOM_MAX_FROM_DATE))) {
        dateFrom = FATHOM_MAX_FROM_DATE;
        parsedDateFrom = new Date(FATHOM_MAX_FROM_DATE);
      }

      console.log('call');

      const { profile, bucketUrl } = await getBucketUrl({ username });
      if (!profile || !bucketUrl) {
        // const errorId = Sentry.captureMessage(
        //   `No profile or bucketUrl for ${username}`
        // );
        res.status(500).send({ error: `Internal server error: TODO` });
        // TODO test to throw an error here and it should be catched by Sentry middleware
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

      console.log('hey 4', { referrersResponse });
      res.status(200);
      return referrersResponse;
    }
  );
}
