import { FastifyInstance } from 'fastify';
import { differenceInMonths, format, isValid, parse } from 'date-fns';
import { maxFathomFromDate, getBucketUrl, getPublicStories } from './utils';
import { redis } from '../../../redis';
import { config } from '../../../config';
import { StacksService } from '../stacks/service';
import { SubscriptionService } from '../subscriptions/service';
import { plausibleClient } from '../../../external/plausible';

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
const analyticsHistoricalResponseSchema = {
  type: 'object',
  properties: {
    historical: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          visits: { type: 'number' },
          pageviews: { type: 'number' },
        },
      },
    },
    stories: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pathname: { type: 'string' },
          visits: { type: 'number' },
          pageviews: { type: 'number' },
        },
      },
    },
  },
};

export async function createAnalyticsHistoricalEndpoint(
  fastify: FastifyInstance
) {
  return fastify.get<{
    Querystring: AnalyticsHistoricalParams;
    Reply: AnalyticsHistoricalResponseError | AnalyticsHistoricalResponse;
  }>(
    '/api/analytics/historical',
    {
      onRequest: [fastify.authenticate],
      config: {
        rateLimit: {
          max: config.NODE_ENV === 'test' ? 1000 : 10,
          timeWindow: 60000,
        },
      },
      schema: {
        response: {
          200: analyticsHistoricalResponseSchema,
        },
      },
    },
    async (req, res) => {
      const { dateGrouping, storyId } = req.query;
      let { dateFrom } = req.query;
      const dateTo = new Date();

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

      if (!dateGrouping) {
        res.status(400).send({ error: 'dateGrouping is required' });
        return;
      }
      if (dateGrouping !== 'day' && dateGrouping !== 'month') {
        res.status(400).send({ error: 'dateGrouping must be day or month' });
        return;
      }

      // Can only request up to 2 month of daily grouping
      if (
        differenceInMonths(dateTo, parsedDateFrom) > 2 &&
        dateGrouping === 'day'
      ) {
        res.status(400).send({
          error: 'dateFrom must be within 2 months when grouping by days',
        });
        return;
      }

      // Set max date in the past
      dateFrom = maxFathomFromDate(parsedDateFrom, dateFrom);

      const activeSubscription =
        await SubscriptionService.getActiveSubscriptionByAddress({
          address: req.address,
        });
      if (!activeSubscription) {
        res.status(401).send({ error: 'No active subscription' });
        return;
      }

      const username = await StacksService.getUsernameByAddress(req.address);

      // Caching mechanism to avoid hitting Plausible too often
      const cacheKey = storyId
        ? `historical:${username}_${dateFrom}_${dateGrouping}_${storyId}`
        : `historical:${username}_${dateFrom}_${dateGrouping}`;
      const cachedResponse = await redis.get(cacheKey);
      if (cachedResponse && config.NODE_ENV !== 'test') {
        res.status(200).send(JSON.parse(cachedResponse));
        return;
      }

      const historicalResponse: AnalyticsHistoricalResponse = {
        historical: [],
        stories: [],
      };

      const { profile, bucketUrl } = await getBucketUrl({ username });
      if (!profile || !bucketUrl) {
        throw new Error(`No profile or bucketUrl for ${username}`);
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

      const plausibleResults = await plausibleClient.timeseries({
        dateFrom,
        dateGrouping,
        dateTo: format(dateTo, 'yyyy-MM-dd'),
        paths: storiesPath,
      });

      historicalResponse.historical = plausibleResults.map((result) => ({
        date: result.date,
        pageviews: result.pageviews,
        visits: result.visitors,
      }));

      // const plausibleReferrers = await plausibleClient.referrers({
      //   dateFrom,
      //   dateTo: format(dateTo, 'yyyy-MM-dd'),
      //   paths: storiesPath,
      // });
      // console.log(JSON.stringify(plausibleReferrers, null, 2));

      /**
       * Stories aggregated results.
       * To limit the calls made to Fathom we reuse the data returned in this API endpoint but ideally
       * once Fathom API is more flexible, this should be moved to it's own endpoint.
       */

      const plausiblePages = await plausibleClient.pages({
        dateFrom,
        dateTo: format(dateTo, 'yyyy-MM-dd'),
        paths: storiesPath,
      });

      historicalResponse.stories = plausiblePages.map((result) => ({
        pathname:
          result.page === `/${username}`
            ? '/'
            : result.page.replace(`/${username}/`, ''),
        pageviews: result.pageviews,
        visits: result.visitors,
      }));

      // Cache response for 1 hour
      await redis.set(
        cacheKey,
        JSON.stringify(historicalResponse),
        'EX',
        60 * 60
      );

      res.status(200).send(historicalResponse);
    }
  );
}
