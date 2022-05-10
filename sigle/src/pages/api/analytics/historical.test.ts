/* eslint-disable @typescript-eslint/no-explicit-any */
import { analyticsHistoricalEndpoint } from './historical.api';
import { fathomClient } from '../../../external/fathom';

jest.mock('../../../external/fathom');

it('Should throw an error if dateFrom is missing', async () => {
  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    { query: {} } as any,
    {
      status,
    } as any
  );
  expect(status).toBeCalledWith(400);
  expect(json).toBeCalledWith({ error: 'dateFrom is required' });
});

it('Should throw an error if dateFrom is invalid', async () => {
  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    { query: { dateFrom: 'invalid' } } as any,
    {
      status,
    } as any
  );
  expect(status).toBeCalledWith(400);
  expect(json).toBeCalledWith({ error: 'dateFrom is invalid' });
});

it('Should throw an error if dateGrouping is missing', async () => {
  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    { query: { dateFrom: '2022-05-04' } } as any,
    {
      status,
    } as any
  );
  expect(status).toBeCalledWith(400);
  expect(json).toBeCalledWith({ error: 'dateGrouping is required' });
});

it('Should throw an error if dateGrouping is invalid', async () => {
  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    { query: { dateFrom: '2022-05-04', dateGrouping: 'invalid' } } as any,
    {
      status,
    } as any
  );
  expect(status).toBeCalledWith(400);
  expect(json).toBeCalledWith({ error: 'dateGrouping must be day or month' });
});

it('Should throw an error if dateGrouping is day and dateFrom > 2 month', async () => {
  jest
    .useFakeTimers()
    .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    { query: { dateFrom: '2022-01-04', dateGrouping: 'day' } } as any,
    {
      status,
    } as any
  );
  expect(status).toBeCalledWith(400);
  expect(json).toBeCalledWith({
    error: 'dateFrom must be within 2 months when grouping by days',
  });
});

it('Respond with a formatted time series for days', async () => {
  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers()
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

  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    { query: { dateFrom: '2022-03-15', dateGrouping: 'day' } } as any,
    {
      status,
    } as any
  );
  expect(fathomClient.aggregatePath).toBeCalledTimes(25);
  expect(status).toBeCalledWith(200);
  expect(json).toMatchSnapshot();

  (fathomClient.aggregatePath as jest.Mock).mockReset();
});

it('Respond with a formatted time series for months', async () => {
  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers()
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

  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    { query: { dateFrom: '2022-01-02', dateGrouping: 'month' } } as any,
    {
      status,
    } as any
  );
  expect(fathomClient.aggregatePath).toBeCalledTimes(25);
  expect(status).toBeCalledWith(200);
  expect(json).toMatchSnapshot();

  (fathomClient.aggregatePath as jest.Mock).mockReset();
});

it('Respond with a formatted time series for one story', async () => {
  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers()
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

  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    {
      query: { dateFrom: '2022-03-15', dateGrouping: 'day', storyId: 'test' },
    } as any,
    {
      status,
    } as any
  );
  expect(fathomClient.aggregatePath).toBeCalledTimes(1);
  expect(status).toBeCalledWith(200);
  expect(json).toMatchSnapshot();
});
