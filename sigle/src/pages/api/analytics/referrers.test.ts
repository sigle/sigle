/* eslint-disable @typescript-eslint/no-explicit-any */
import { analyticsReferrersEndpoint } from './referrers.api';
import { fathomClient } from '../../../external/fathom';

jest.mock('../../../external/fathom');

beforeEach(() => {
  (fathomClient.aggregateReferrers as jest.Mock).mockReset();
});

it('Should throw an error if dateFrom is missing', async () => {
  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsReferrersEndpoint(
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

  await analyticsReferrersEndpoint(
    { query: { dateFrom: 'invalid' } } as any,
    {
      status,
    } as any
  );
  expect(status).toBeCalledWith(400);
  expect(json).toBeCalledWith({ error: 'dateFrom is invalid' });
});

it('Respond with referrers', async () => {
  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers()
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

  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsReferrersEndpoint(
    { query: { dateFrom: '2022-03-15' } } as any,
    {
      status,
    } as any
  );
  expect(fathomClient.aggregateReferrers).toBeCalledTimes(25);
  expect(status).toBeCalledWith(200);
  expect(json).toMatchSnapshot();
});

it('Respond with referrers for one story', async () => {
  // Set a fake timer so we can verify the end date
  jest
    .useFakeTimers()
    .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
  (fathomClient.aggregateReferrers as jest.Mock).mockResolvedValueOnce([
    {
      uniques: '5',
      referrer_hostname: 'https://stacks.co',
    },
  ]);
  (fathomClient.aggregatePath as jest.Mock).mockResolvedValue([]);

  const json = jest.fn();
  const status = jest.fn(() => ({
    json,
  }));

  await analyticsReferrersEndpoint(
    {
      query: { dateFrom: '2022-03-15', storyId: 'test' },
    } as any,
    {
      status,
    } as any
  );
  expect(fathomClient.aggregateReferrers).toBeCalledTimes(1);
  expect(status).toBeCalledWith(200);
  expect(json).toMatchSnapshot();
});
