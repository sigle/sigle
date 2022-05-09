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

it('Respond with a formatted time series', async () => {
  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers()
    .setSystemTime(new Date('2022-04-04 00:00:00 UTC').getTime());
  (fathomClient.aggregatePath as jest.Mock).mockResolvedValue([]);

  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    { query: { dateFrom: '2022-02-02', dateGrouping: 'day' } } as any,
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
    .setSystemTime(new Date('2022-04-04 00:00:00 UTC').getTime());
  (fathomClient.aggregatePath as jest.Mock).mockResolvedValue([]);

  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsHistoricalEndpoint(
    {
      query: { dateFrom: '2022-02-02', dateGrouping: 'day', storyId: 'test' },
    } as any,
    {
      status,
    } as any
  );
  expect(fathomClient.aggregatePath).toBeCalledTimes(1);
  expect(status).toBeCalledWith(200);
  expect(json).toMatchSnapshot();
});
