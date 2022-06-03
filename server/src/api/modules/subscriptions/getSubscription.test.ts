/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify';
import { prisma } from '../../../prisma';
import { redis } from '../../../redis';
import { buildFastifyServer } from '../../../server';

let server: FastifyInstance;

beforeAll(() => {
  server = buildFastifyServer();
});

afterAll(async () => {
  await redis.quit();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.subscription.deleteMany({});
  await prisma.user.deleteMany({});
});

it('Should return null if user has no active subscription', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/api/subscriptions',
    cookies: {
      'next-auth.session-token': '0x123',
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual(null);
});

it('Should return the current logged in user active subscription', async () => {
  const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
  const nftId = 2123;
  await prisma.user.create({
    data: {
      stacksAddress,
      subscriptions: {
        create: {
          nftId,
          status: 'ACTIVE',
        },
      },
    },
  });

  const response = await server.inject({
    method: 'GET',
    url: '/api/subscriptions',
    cookies: {
      'next-auth.session-token': stacksAddress,
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchObject({ id: expect.any(String), nftId });
});
