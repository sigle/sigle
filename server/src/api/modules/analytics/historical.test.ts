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
  (fathomClient.aggregatePath as jest.Mock).mockReset();
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
  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers(fakeTimerConfigDate)
    .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
  (fathomClient.aggregatePath as jest.Mock).mockResolvedValueOnce([
    {
      visits: '5',
      pageviews: '1',
      date: '2022-03-20',
      pathname: '/test.btc/path-test',
    },
  ]);
  (fathomClient.aggregatePath as jest.Mock).mockResolvedValueOnce([
    {
      visits: '7',
      pageviews: '3',
      date: '2022-03-20',
      pathname: '/test.btc/path-test-2',
    },
  ]);
  (fathomClient.aggregatePath as jest.Mock).mockResolvedValue([]);

  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/historical?dateFrom=2022-03-15&dateGrouping=day',
    cookies: {
      'next-auth.session-token': '0x123',
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchSnapshot();
  expect(fathomClient.aggregatePath).toBeCalledTimes(26);
});

it('Respond with a formatted time series for months', async () => {
  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers(fakeTimerConfigDate)
    .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
  (fathomClient.aggregatePath as jest.Mock).mockResolvedValueOnce([
    {
      visits: '5',
      pageviews: '1',
      date: '2022-03',
      pathname: '/test.btc/path-test',
    },
  ]);
  (fathomClient.aggregatePath as jest.Mock).mockResolvedValueOnce([
    {
      visits: '7',
      pageviews: '3',
      date: '2022-03',
      pathname: '/test.btc/path-test-2',
    },
  ]);
  (fathomClient.aggregatePath as jest.Mock).mockResolvedValue([]);

  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/historical?dateFrom=2022-01-02&dateGrouping=month',
    cookies: {
      'next-auth.session-token': '0x123',
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchSnapshot();
  expect(fathomClient.aggregatePath).toBeCalledTimes(26);
});

it('Respond with a formatted time series for one story', async () => {
  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers(fakeTimerConfigDate)
    .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
  (fathomClient.aggregatePath as jest.Mock).mockResolvedValueOnce([
    {
      visits: '5',
      pageviews: '1',
      date: '2022-03-20',
      pathname: '/test.btc/path-test',
    },
  ]);
  (fathomClient.aggregatePath as jest.Mock).mockResolvedValue([]);

  const response = await server.inject({
    method: 'GET',
    url: '/api/analytics/historical?dateFrom=2022-03-15&dateGrouping=day&storyId=test',
    cookies: {
      'next-auth.session-token': '0x123',
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchSnapshot();
  expect(fathomClient.aggregatePath).toBeCalledTimes(1);
});
