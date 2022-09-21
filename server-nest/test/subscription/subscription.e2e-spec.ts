import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { fetch } from 'undici';
import { AppModule } from '../../src/app.module';

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

  it('/api/subscriptions (GET) - return null', async () => {
    const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
    const result = await app.inject({
      method: 'GET',
      url: '/api/subscriptions',
      cookies: {
        'next-auth.session-token': stacksAddress,
      },
    });
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.payload)).toEqual(null);
  });

  it('/api/subscriptions/creatorPlus (POST) - create subscription', async () => {
    const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
    const nftId = 2123;
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

  it('/api/subscriptions (GET) - return subscription', async () => {
    const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
    const nftId = 2123;
    const result = await app.inject({
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

  it('/api/subscriptions/creatorPlus (POST) - update subscription', async () => {
    const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
    const nftId = 1149;
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
