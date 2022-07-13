/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify';
import { TestBaseDB, TestDBUser } from '../../../jest/db';
import { prisma } from '../../../prisma';
import { redis } from '../../../redis';
import { buildFastifyServer } from '../../../server';

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
  await prisma.user.deleteMany({});
  await prisma.subscription.deleteMany({});
});

it('Should return public user without subscription', async () => {
  const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
  const user = await TestDBUser.seedUser({
    stacksAddress,
  });

  const response = await server.inject({
    method: 'GET',
    url: `/api/users/${stacksAddress}`,
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({ id: user.id, stacksAddress });
});

it('Should return public user with subscription', async () => {
  const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
  const user = await TestDBUser.seedUserWithSubscription({
    stacksAddress,
  });

  const response = await server.inject({
    method: 'GET',
    url: `/api/users/${stacksAddress}`,
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    id: user.id,
    stacksAddress,
    subscription: {
      id: expect.any(String),
      nftId: expect.any(Number),
    },
  });
});
