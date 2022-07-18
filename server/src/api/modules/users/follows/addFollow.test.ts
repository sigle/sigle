/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify';
import { TestBaseDB, TestDBUser } from '../../../../jest/db';
import { prisma } from '../../../../prisma';
import { redis } from '../../../../redis';
import { buildFastifyServer } from '../../../../server';

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
  await prisma.follows.deleteMany({});
  await prisma.user.deleteMany({});
});

it('Should throw an error if stacksAddress is missing', async () => {
  const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
  const response = await server.inject({
    method: 'POST',
    url: `/api/users/me/following`,
    cookies: {
      'next-auth.session-token': stacksAddress,
    },
    payload: {},
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({
    error: 'Bad Request',
    message: "body must have required property 'stacksAddress'",
    statusCode: 400,
  });
});

it('Should throw an error if createdAt is missing', async () => {
  const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
  const response = await server.inject({
    method: 'POST',
    url: `/api/users/me/following`,
    cookies: {
      'next-auth.session-token': stacksAddress,
    },
    payload: {
      stacksAddress,
    },
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({
    error: 'Bad Request',
    message: "body must have required property 'createdAt'",
    statusCode: 400,
  });
});

it('Should create follow', async () => {
  const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
  const stacksAddress2 = 'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173';
  await TestDBUser.seedUser({
    stacksAddress,
  });
  await TestDBUser.seedUser({
    stacksAddress: stacksAddress2,
  });

  const response = await server.inject({
    method: 'POST',
    url: `/api/users/me/following`,
    cookies: {
      'next-auth.session-token': stacksAddress,
    },
    payload: {
      stacksAddress: stacksAddress2,
      createdAt: Date.now(),
    },
  });

  expect(response.statusCode).toBe(200);
  expect(await prisma.follows.findMany()).toEqual([
    {
      createdAt: expect.any(Date),
      followerAddress: stacksAddress,
      followingAddress: stacksAddress2,
    },
    {
      createdAt: expect.any(Date),
      followerAddress: stacksAddress2,
      followingAddress: stacksAddress,
    },
  ]);
});
