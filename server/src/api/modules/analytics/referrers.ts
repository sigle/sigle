import { FastifyInstance } from 'fastify';
import { format, isValid, parse } from 'date-fns';
import { maxFathomFromDate, getBucketUrl, getPublicStories } from './utils';
import { fathomClient } from '../../../external/fathom';
import { redis } from '../../../redis';
import { config } from '../../../config';
import { StacksService } from '../stacks/service';
import { SubscriptionService } from '../subscriptions/service';
import { plausibleClient } from '../../../external/plausible';

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
const analyticsReferrersResponseSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      domain: { type: 'string', nullable: true },
      count: { type: 'number' },
    },
  },
};

export async function createAnalyticsReferrersEndpoint(
  fastify: FastifyInstance
) {
  return fastify.get<{
    Querystring: AnalyticsReferrersParams;
    Reply: AnalyticsReferrersResponseError | AnalyticsReferrersResponse;
  }>(
    '/api/analytics/referrers',
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
          200: analyticsReferrersResponseSchema,
        },
      },
    },
    async (req, res) => {
      const { storyId } = req.query;
      let { dateFrom } = req.query;
      const dateTo = new Date();

      if (!dateFrom) {
        res.status(400).send({ error: 'dateFrom is required' });
        return;
      }
      const parsedDateFrom = parse(dateFrom, 'yyyy-MM-dd', new Date());
      const isValidDate = isValid(parsedDateFrom);
      if (!isValidDate) {
        res.status(400).send({ error: 'dateFrom is invalid' });
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

      // Caching mechanism to avoid hitting Fathom too often
      const cacheKey = storyId
        ? `referrers:${username}_${dateFrom}_${storyId}`
        : `referrers:${username}_${dateFrom}`;
      // const cachedResponse = await redis.get(cacheKey);
      // if (cachedResponse && config.NODE_ENV !== 'test') {
      //   res.status(200).send(JSON.parse(cachedResponse));
      //   return;
      // }

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

      const plausibleReferrers = await plausibleClient.referrers({
        dateFrom,
        dateTo: format(dateTo, 'yyyy-MM-dd'),
        paths: storiesPath,
      });

      const referrersResponse: AnalyticsReferrersResponse = plausibleReferrers
        .map((result) => ({
          domain: result.source,
          count: result.pageviews,
        }))
        .sort((a, b) => b.count - a.count);

      // Cache response for 1 hour
      await redis.set(
        cacheKey,
        JSON.stringify(referrersResponse),
        'EX',
        60 * 60
      );

      res.status(200).send(referrersResponse);
    }
  );
}
