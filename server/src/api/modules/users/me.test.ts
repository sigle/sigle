/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeAll, afterAll, beforeEach, it, expect } from '@jest/globals';
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
});

it('Should create a new user and return it', async () => {
  const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';

  const response = await server.inject({
    method: 'GET',
    url: '/api/users/me',
    cookies: {
      'next-auth.session-token': stacksAddress,
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({ id: expect.any(String), stacksAddress });
});

it('Should return an existing user', async () => {
  const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
  const user = await TestDBUser.seedUser({
    stacksAddress,
  });

  const response = await server.inject({
    method: 'GET',
    url: '/api/users/me',
    cookies: {
      'next-auth.session-token': stacksAddress,
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({ id: user.id, stacksAddress });
});
