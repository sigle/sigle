import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from '../../src/app.module';

// next-auth workaround as node.js does not have the global Headers
// https://github.com/nextauthjs/next-auth/issues/4988
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.Headers = class Headers {};

describe('AnalyticsController (e2e)', () => {
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

  describe('GET /api/analytics/referrers', () => {
    it('should allow only authenticated users', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/api/analytics/referrers',
      });
      expect(result.statusCode).toBe(403);
    });

    it('should throw on missing query', async () => {
      const stacksAddress = 'SP3W40MRS2BYEK9DEXAZQD5P08F4XR521621HMHTS';
      const result = await app.inject({
        method: 'GET',
        url: '/api/analytics/referrers',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
      });
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.payload)).toEqual({
        error: 'Bad Request',
        message: ['dateFrom must be a string'],
        statusCode: 400,
      });
    });

    it('should throw when no active subscription', async () => {
      const stacksAddress = 'SP3W40MRS2BYEK9DEXAZQD5P08F4XR521621HMHTS';
      const result = await app.inject({
        method: 'GET',
        url: '/api/analytics/referrers?dateFrom=2022-03-15',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
      });
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.payload)).toEqual({
        error: 'Bad Request',
        message: 'No active subscription.',
        statusCode: 400,
      });
    });
  });

  describe('GET /api/analytics/historical', () => {
    it('should allow only authenticated users', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/api/analytics/historical',
      });
      expect(result.statusCode).toBe(403);
    });

    it('should throw on missing query', async () => {
      const stacksAddress = 'SP3W40MRS2BYEK9DEXAZQD5P08F4XR521621HMHTS';
      const result = await app.inject({
        method: 'GET',
        url: '/api/analytics/historical',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
      });
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.payload)).toEqual({
        error: 'Bad Request',
        message: ['dateFrom must be a string', 'dateGrouping must be a string'],
        statusCode: 400,
      });
    });

    it('should throw when no active subscription', async () => {
      const stacksAddress = 'SP3W40MRS2BYEK9DEXAZQD5P08F4XR521621HMHTS';
      const result = await app.inject({
        method: 'GET',
        url: '/api/analytics/historical?dateFrom=2022-03-15&dateGrouping=month',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
      });
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.payload)).toEqual({
        error: 'Bad Request',
        message: 'No active subscription.',
        statusCode: 400,
      });
    });
  });
});
