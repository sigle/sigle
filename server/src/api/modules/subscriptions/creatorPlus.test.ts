/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from 'fastify';
import { redis } from '../../../redis';
import { buildFastifyServer } from '../../../server';

let server: FastifyInstance;

beforeAll(() => {
  server = buildFastifyServer();
});

afterAll(async () => {
  await redis.quit();
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
