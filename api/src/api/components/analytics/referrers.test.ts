/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify';
import { buildFastifyServer } from '../../../app';
import { fathomClient } from '../../../external/fathom';

jest.mock('../../../external/fathom');
// jest.mock('./utils');

let app: FastifyInstance;

beforeAll(() => {
  app = buildFastifyServer();

  //   (getBucketUrl as jest.Mock).mockResolvedValue({
  //     profile: {},
  //     bucketUrl:
  //       'https://gaia.blockstack.org/hub/1KvMJEjCMjwLxK4VHJn3wyYCcEuzB8qjZH/profile.json',
  //   });
  //   (getPublicStories as jest.Mock).mockResolvedValue([
  //     {
  //       id: 'OCYqr_BQPgc2s8OIzGGsZ',
  //     },
  //     {
  //       id: 'SNbuVl9AzNZbm7VfkJQbr',
  //     },
  //     {
  //       id: 'zxM7DTqBaIBsrhH3zklpq',
  //     },
  //   ]);
});

beforeEach(() => {
  (fathomClient.aggregateReferrers as jest.Mock).mockReset();
});

it('Should throw an error if dateFrom is missing', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/analytics/referrers',
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({ error: 'dateFrom is required' });
});

it('Should throw an error if dateFrom is invalid', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/analytics/referrers?dateFrom=invalid',
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({ error: 'dateFrom is invalid' });
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

  const response = await app.inject({
    method: 'GET',
    url: '/api/analytics/referrers?dateFrom=2022-03-15',
  });

  console.log('test response');

  expect(fathomClient.aggregateReferrers).toBeCalledTimes(25);
  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchSnapshot();
});

// it('Respond with referrers for one story', async () => {
//   // Set a fake timer so we can verify the end date
//   jest
//     .useFakeTimers()
//     .setSystemTime(new Date('2022-04-04 12:00:00 UTC').getTime());
//   (fathomClient.aggregateReferrers as jest.Mock).mockResolvedValueOnce([
//     {
//       uniques: '5',
//       referrer_hostname: 'https://stacks.co',
//     },
//   ]);
//   (fathomClient.aggregateReferrers as jest.Mock).mockResolvedValue([]);

//   const json = jest.fn();
//   const status = jest.fn(() => ({
//     json,
//   }));

//   await analyticsReferrersEndpoint(
//     {
//       query: { dateFrom: '2022-03-15', storyId: 'test' },
//     } as any,
//     {
//       status,
//     } as any
//   );
//   expect(fathomClient.aggregateReferrers).toBeCalledTimes(1);
//   expect(status).toBeCalledWith(200);
//   expect(json).toMatchSnapshot();
// });
