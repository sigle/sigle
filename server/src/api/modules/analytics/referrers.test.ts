/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify';
import { fathomClient } from '../../../external/fathom';
import { fakeTimerConfigDate } from '../../../jest/utils';
import { redis } from '../../../redis';
import { buildFastifyServer } from '../../../server';

jest.mock('../../../external/fathom');

let server: FastifyInstance;

beforeAll(() => {
  server = buildFastifyServer();
});

afterAll(async () => {
  await redis.quit();
});

beforeEach(() => {
  (fathomClient.aggregateReferrers as jest.Mock).mockReset();
});

it('Should throw an error if dateFrom is missing', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/referrers',
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({ error: 'dateFrom is required' });
});

it('Should throw an error if dateFrom is invalid', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/referrers?dateFrom=invalid',
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({ error: 'dateFrom is invalid' });
});

it('Respond with referrers', async () => {
  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers(fakeTimerConfigDate)
    .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
  (fathomClient.aggregateReferrers as jest.Mock).mockResolvedValueOnce([
    {
      uniques: '1',
      referrer_hostname: 'https://stacks.co',
    },
    {
      uniques: '10',
      referrer_hostname: null,
    },
  ]);
  (fathomClient.aggregateReferrers as jest.Mock).mockResolvedValueOnce([
    {
      uniques: '5',
      referrer_hostname: 'https://stacks.co',
    },
  ]);
  (fathomClient.aggregateReferrers as jest.Mock).mockResolvedValue([]);

  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/referrers?dateFrom=2022-03-15',
  });

  expect(fathomClient.aggregateReferrers).toBeCalledTimes(26);
  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchSnapshot();
});

it('Respond with referrers for one story', async () => {
  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers(fakeTimerConfigDate)
    .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
  (fathomClient.aggregateReferrers as jest.Mock).mockResolvedValueOnce([
    {
      uniques: '5',
      referrer_hostname: 'https://stacks.co',
    },
  ]);
  (fathomClient.aggregateReferrers as jest.Mock).mockResolvedValue([]);

  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/referrers?dateFrom=2022-03-15&storyId=test',
  });

  expect(fathomClient.aggregateReferrers).toBeCalledTimes(1);
  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchSnapshot();
});
