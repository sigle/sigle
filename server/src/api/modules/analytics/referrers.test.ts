/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify';
import { plausibleClient } from '../../../external/plausible';
import { fakeTimerConfigDate } from '../../../jest/utils';
import { TestBaseDB, TestDBUser } from '../../../jest/db';
import { prisma } from '../../../prisma';
import { redis } from '../../../redis';
import { buildFastifyServer } from '../../../server';

jest.mock('../../../external/plausible');

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
  (plausibleClient.referrers as jest.Mock).mockReset();
});

it('Respond with referrers', async () => {
  const stacksAddress = 'SP2BKHGRV8H2YDJK16FP5VASYFDGYN4BPTNFWDKYJ';
  await TestDBUser.seedUserWithSubscription({ stacksAddress });

  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers(fakeTimerConfigDate)
    .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
  (plausibleClient.referrers as jest.Mock).mockResolvedValueOnce([
    {
      pageviews: '1',
      source: 'https://stacks.co',
    },
    {
      pageviews: '10',
      source: 'Direct / None',
    },
  ]);

  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/referrers?dateFrom=2022-03-15',
    cookies: {
      'next-auth.session-token': stacksAddress,
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchSnapshot();
  expect(plausibleClient.referrers).toBeCalledWith({
    dateFrom: '2022-05-01',
    dateTo: '2022-04-04',
    paths: expect.any(Array),
  });
});

it('Respond with referrers for one story', async () => {
  const stacksAddress = 'SP2BKHGRV8H2YDJK16FP5VASYFDGYN4BPTNFWDKYJ';
  await TestDBUser.seedUserWithSubscription({ stacksAddress });

  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers(fakeTimerConfigDate)
    .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
  (plausibleClient.referrers as jest.Mock).mockResolvedValueOnce([
    {
      pageviews: '5',
      source: 'https://stacks.co',
    },
  ]);

  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/referrers?dateFrom=2022-03-15&storyId=test',
    cookies: {
      'next-auth.session-token': stacksAddress,
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchSnapshot();
  expect(plausibleClient.referrers).toBeCalledWith({
    dateFrom: '2022-05-01',
    dateTo: '2022-04-04',
    paths: ['/sigleapp.id.blockstack/test'],
  });
});
