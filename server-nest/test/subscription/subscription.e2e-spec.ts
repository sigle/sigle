import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { fetch } from 'undici';
import { AppModule } from '../../src/app.module';

// next-auth workaround as node.js does not have the global Headers
// https://github.com/nextauthjs/next-auth/issues/4988
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.Headers = class Headers {};

// micro-stacks require a global fetch function
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.fetch = fetch;

describe('SubscriptionController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - types are off
    app.register(fastifyCookie);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/subscriptions', () => {
    it('should return null', async () => {
      const stacksAddress = 'SP24GYRG3M7T0S6FZE9RVVP9PNNZQJQ614650G590';
      const result = await app.inject({
        method: 'GET',
        url: '/api/subscriptions',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
        headers: {
          'user-agent': 'sigletests',
        },
      });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.payload)).toEqual(null);
    });

    it('should return active subscription', async () => {
      const stacksAddress = 'SP24GYRG3M7T0S6FZE9RVVP9PNNZQJQ614650G590';
      const nftId = 284;
      let result = await app.inject({
        method: 'POST',
        url: '/api/subscriptions/creatorPlus',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
        headers: {
          'user-agent': 'sigletests',
        },
        payload: {
          nftId,
        },
      });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.payload)).toEqual({
        id: expect.any(String),
        nftId,
      });

      result = await app.inject({
        method: 'GET',
        url: '/api/subscriptions',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
      });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.payload)).toEqual({
        id: expect.any(String),
        nftId,
      });
    });
  });

  describe('POST /api/subscriptions/creatorPlus', () => {
    it('should allow only authenticated users', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/api/subscriptions/creatorPlus',
        headers: {
          'user-agent': 'sigletests',
        },
      });
      expect(result.statusCode).toBe(403);
    });

    it('should throw on missing body', async () => {
      const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
      const result = await app.inject({
        method: 'POST',
        url: '/api/subscriptions/creatorPlus',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
        headers: {
          'user-agent': 'sigletests',
        },
      });
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.payload)).toEqual({
        error: 'Bad Request',
        message: [
          'nftId must not be greater than 3000',
          'nftId must not be less than 0',
          'nftId must be an integer number',
        ],
        statusCode: 400,
      });
    });

    it('should throw if user is not the owner', async () => {
      const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
      const result = await app.inject({
        method: 'POST',
        url: '/api/subscriptions/creatorPlus',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
        headers: {
          'user-agent': 'sigletests',
        },
        payload: {
          nftId: 10,
        },
      });
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.payload)).toEqual({
        error: 'Bad Request',
        message: 'NFT #10 is not owned by user.',
        statusCode: 400,
      });
    });

    it('should create an active subscription linked to the nft', async () => {
      const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
      const nftId = 2123;
      const result = await app.inject({
        method: 'POST',
        url: '/api/subscriptions/creatorPlus',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
        headers: {
          'user-agent': 'sigletests',
        },
        payload: {
          nftId,
        },
      });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.payload)).toEqual({
        id: expect.any(String),
        nftId,
      });
    });

    it('should change the NFT if user has an active subscription', async () => {
      const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
      const nftId = 1613;
      const result = await app.inject({
        method: 'POST',
        url: '/api/subscriptions/creatorPlus',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
        payload: {
          nftId,
        },
      });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.payload)).toEqual({
        id: expect.any(String),
        nftId,
      });
    });
  });
});
