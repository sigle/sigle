/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify';
import { fathomClient } from '../../../external/fathom';
import { fakeTimerConfigDate } from '../../../jest/utils';
import { TestBaseDB, TestDBUser } from '../../../jest/db';
import { prisma } from '../../../prisma';
import { redis } from '../../../redis';
import { buildFastifyServer } from '../../../server';

jest.mock('../../../external/fathom');

let server: FastifyInstance;

beforeAll(() => {
  server = buildFastifyServer();
});

afterAll(async () => {
  await TestBaseDB.cleanup();
  await redis.quit();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.subscription.deleteMany({});
  await prisma.user.deleteMany({});
});

beforeEach(() => {
  (fathomClient.aggregateReferrers as jest.Mock).mockReset();
});

it('Respond with referrers', async () => {
  const stacksAddress = 'SP2BKHGRV8H2YDJK16FP5VASYFDGYN4BPTNFWDKYJ';
  await TestDBUser.seedUserWithSubscription({ stacksAddress });

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
    cookies: {
      'next-auth.session-token': stacksAddress,
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchSnapshot();
  expect(fathomClient.aggregateReferrers).toBeCalledTimes(26);
});

it('Respond with referrers for one story', async () => {
  const stacksAddress = 'SP2BKHGRV8H2YDJK16FP5VASYFDGYN4BPTNFWDKYJ';
  await TestDBUser.seedUserWithSubscription({ stacksAddress });

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
    cookies: {
      'next-auth.session-token': stacksAddress,
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchSnapshot();
  expect(fathomClient.aggregateReferrers).toBeCalledTimes(1);
});
