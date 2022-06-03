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

it('Should throw an error if nftId is missing', async () => {
  const response = await server.inject({
    method: 'POST',
    url: '/api/subscriptions/creatorPlus',
    cookies: {
      'next-auth.session-token': '0x123',
    },
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({ error: 'nftId is required' });
});

it('Should throw an error if nftId is invalid', async () => {
  const response = await server.inject({
    method: 'POST',
    url: '/api/subscriptions/creatorPlus',
    cookies: {
      'next-auth.session-token': '0x123',
    },
    payload: {
      nftId: 'invalid',
    },
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({ error: 'nftId is invalid' });
});

it('Should throw an error if user is not the owner', async () => {
  const response = await server.inject({
    method: 'POST',
    url: '/api/subscriptions/creatorPlus',
    cookies: {
      'next-auth.session-token': '0x123',
    },
    payload: {
      nftId: 1,
    },
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({ error: 'NFT #1 is not owned by user' });
});

it('Should throw an error if user has an active subscription', async () => {
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
    method: 'POST',
    url: '/api/subscriptions/creatorPlus',
    cookies: {
      'next-auth.session-token': 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q',
    },
    payload: {
      nftId,
    },
  });

  expect(response.statusCode).toBe(400);
  expect(response.json()).toEqual({
    error: 'User already has an active subscription',
  });
});

it('Should create an active subscription linked to the nft', async () => {
  const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
  const nftId = 2123;
  const user = await prisma.user.create({
    data: {
      stacksAddress,
    },
  });

  const response = await server.inject({
    method: 'POST',
    url: '/api/subscriptions/creatorPlus',
    cookies: {
      'next-auth.session-token': 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q',
    },
    payload: {
      nftId,
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({
    success: true,
  });
  expect(
    await prisma.subscription.findMany({ where: { userId: user.id } })
  ).toMatchObject([
    {
      id: expect.any(String),
      nftId,
      status: 'ACTIVE',
      userId: user.id,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    },
  ]);
});
