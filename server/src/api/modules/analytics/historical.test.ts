/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify';
import { plausibleClient } from '../../../external/plausible';
import { TestBaseDB, TestDBUser } from '../../../jest/db';
import { fakeTimerConfigDate } from '../../../jest/utils';
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
  (plausibleClient.timeseries as jest.Mock).mockReset();
  (plausibleClient.pages as jest.Mock).mockReset();
});

it('Should throw an error if dateFrom is missing', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/historical',
    cookies: {
      'next-auth.session-token': '0x123',
    },
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({ error: 'dateFrom is required' });
});

it('Should throw an error if dateFrom is invalid', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/historical?dateFrom=invalid',
    cookies: {
      'next-auth.session-token': '0x123',
    },
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({ error: 'dateFrom is invalid' });
});

it('Should throw an error if dateGrouping is missing', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/historical?dateFrom=2022-05-04',
    cookies: {
      'next-auth.session-token': '0x123',
    },
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({ error: 'dateGrouping is required' });
});

it('Should throw an error if dateGrouping is invalid', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/historical?dateFrom=2022-05-04&dateGrouping=invalid',
    cookies: {
      'next-auth.session-token': '0x123',
    },
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({
    error: 'dateGrouping must be day or month',
  });
});

it('Should throw an error if dateGrouping is day and dateFrom > 2 month', async () => {
  jest
    .useFakeTimers(fakeTimerConfigDate)
    .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());

  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/historical?dateFrom=2022-01-04&dateGrouping=day',
    cookies: {
      'next-auth.session-token': '0x123',
    },
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({
    error: 'dateFrom must be within 2 months when grouping by days',
  });
});

it('Respond with a formatted time series for days', async () => {
  const stacksAddress = 'SP2BKHGRV8H2YDJK16FP5VASYFDGYN4BPTNFWDKYJ';
  await TestDBUser.seedUserWithSubscription({ stacksAddress });

  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers(fakeTimerConfigDate)
    .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
  (plausibleClient.timeseries as jest.Mock).mockResolvedValueOnce([
    {
      visitors: '5',
      pageviews: '1',
      date: '2022-03-20',
    },
    {
      visitors: '7',
      pageviews: '3',
      date: '2022-03-20',
    },
  ]);
  (plausibleClient.pages as jest.Mock).mockResolvedValueOnce([
    {
      visitors: '5',
      pageviews: '1',
      page: '/test.btc/path-test',
    },
    {
      visitors: '7',
      pageviews: '3',
      page: '/test.btc/path-test-2',
    },
  ]);

  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/historical?dateFrom=2022-03-15&dateGrouping=day',
    cookies: {
      'next-auth.session-token': stacksAddress,
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchSnapshot();
  expect(plausibleClient.timeseries).toBeCalledWith({
    dateFrom: '2022-05-01',
    dateGrouping: 'day',
    dateTo: '2022-04-04',
    paths: expect.any(Array),
  });
  expect(plausibleClient.pages).toBeCalledWith({
    dateFrom: '2022-05-01',
    dateTo: '2022-04-04',
    paths: expect.any(Array),
  });
});

it('Respond with a formatted time series for months', async () => {
  const stacksAddress = 'SP2BKHGRV8H2YDJK16FP5VASYFDGYN4BPTNFWDKYJ';
  await TestDBUser.seedUserWithSubscription({ stacksAddress });

  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers(fakeTimerConfigDate)
    .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
  (plausibleClient.timeseries as jest.Mock).mockResolvedValueOnce([
    {
      visitors: '5',
      pageviews: '1',
      date: '2022-03-01',
    },
  ]);
  (plausibleClient.pages as jest.Mock).mockResolvedValueOnce([
    {
      visitors: '5',
      pageviews: '1',
      page: '/test.btc/path-test',
    },
    {
      visitors: '7',
      pageviews: '3',
      page: '/test.btc/path-test-2',
    },
  ]);

  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/historical?dateFrom=2022-01-02&dateGrouping=month',
    cookies: {
      'next-auth.session-token': stacksAddress,
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchSnapshot();
  expect(plausibleClient.timeseries).toBeCalledWith({
    dateFrom: '2022-05-01',
    dateGrouping: 'day',
    dateTo: '2022-04-04',
    paths: expect.any(Array),
  });
  expect(plausibleClient.pages).toBeCalledWith({
    dateFrom: '2022-05-01',
    dateTo: '2022-04-04',
    paths: expect.any(Array),
  });
});

it('Respond with a formatted time series for one story', async () => {
  const stacksAddress = 'SP2BKHGRV8H2YDJK16FP5VASYFDGYN4BPTNFWDKYJ';
  await TestDBUser.seedUserWithSubscription({ stacksAddress });

  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers(fakeTimerConfigDate)
    .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
  (plausibleClient.timeseries as jest.Mock).mockResolvedValueOnce([
    {
      visitors: '5',
      pageviews: '1',
      date: '2022-03-01',
    },
  ]);
  (plausibleClient.pages as jest.Mock).mockResolvedValueOnce([
    {
      visitors: '5',
      pageviews: '1',
      page: '/test.btc/path-test',
    },
  ]);

  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/historical?dateFrom=2022-03-15&dateGrouping=day&storyId=test',
    cookies: {
      'next-auth.session-token': stacksAddress,
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchSnapshot();
  expect(plausibleClient.timeseries).toBeCalledWith({
    dateFrom: '2022-05-01',
    dateGrouping: 'day',
    dateTo: '2022-04-04',
    paths: expect.any(Array),
  });
  expect(plausibleClient.pages).toBeCalledWith({
    dateFrom: '2022-05-01',
    dateTo: '2022-04-04',
    paths: expect.any(Array),
  });
});
