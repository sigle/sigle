import { FastifyInstance } from 'fastify';
import { isValid, parse } from 'date-fns';
import { maxFathomFromDate, getBucketUrl, getPublicStories } from './utils';
import { fathomClient } from '../../../external/fathom';
import { redis } from '../../../redis';
import { config } from '../../../config';
import { StacksService } from '../stacks/service';

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

      const username = await StacksService.getUsernameByAddress(req.address);

      // Caching mechanism to avoid hitting Fathom too often
      const cacheKey = storyId
        ? `referrers:${username}_${dateFrom}_${storyId}`
        : `referrers:${username}_${dateFrom}`;
      const cachedResponse = await redis.get(cacheKey);
      if (cachedResponse && config.NODE_ENV !== 'test') {
        res.status(200).send(JSON.parse(cachedResponse));
        return;
      }

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
