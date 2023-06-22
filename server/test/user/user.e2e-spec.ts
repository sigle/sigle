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

describe('UserController (e2e)', () => {
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

  describe('GET /api/users/explore', () => {
    it('should return user list', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/api/users/explore?page=1',
      });
      expect(result.statusCode).toBe(200);
      const payload = JSON.parse(result.payload);
      expect(payload.nextPage).toBe(2);
      expect(payload.data.length).toBe(50);
    });

    it('should return empty list when end of pages', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/api/users/explore?page=10',
      });
      expect(result.statusCode).toBe(200);
      const payload = JSON.parse(result.payload);
      expect(payload.nextPage).toBe(null);
      expect(payload.data.length).toBe(0);
    });
  });

  describe('GET /api/users/me', () => {
    it('should allow only authenticated users', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/api/users/me',
      });
      expect(result.statusCode).toBe(403);
    });

    it('should return current logged in user', async () => {
      const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
      const result = await app.inject({
        method: 'GET',
        url: '/api/users/me',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
      });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.payload)).toEqual({
        id: expect.any(String),
        stacksAddress,
        newsletter: null,
        email: null,
        emailVerified: null,
      });
    });
  });

  describe('GET /api/users/:userAddress', () => {
    it('should return null for not found user', async () => {
      const stacksAddress = 'SP2QDMH88MEZ8FFAYHW4B0BTXJRTHX8XBD54FE7HJ';
      const result = await app.inject({
        method: 'GET',
        url: `/api/users/${stacksAddress}`,
      });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.payload)).toEqual(null);
    });

    it('should return any user', async () => {
      const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
      const result = await app.inject({
        method: 'GET',
        url: `/api/users/${stacksAddress}`,
      });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.payload)).toEqual({
        id: expect.any(String),
        stacksAddress,
        followersCount: 2,
        followingCount: 1,
        newsletter: null,
      });
    });
  });

  describe('GET /api/users/:userAddress/followers', () => {
    it('should return user followers list', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/api/users/SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q/followers',
      });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.payload)).toEqual([
        'SP24GYRG3M7T0S6FZE9RVVP9PNNZQJQ614650G590',
        'SP1Y6ZAD2ZZFKNWN58V8EA42R3VRWFJSGWFAD9C36',
      ]);
    });
  });

  describe('GET /api/users/:userAddress/following', () => {
    it('should return user following list', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/api/users/SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q/following',
      });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.payload)).toEqual([
        'SP24GYRG3M7T0S6FZE9RVVP9PNNZQJQ614650G590',
      ]);
    });
  });

  describe('POST /api/users/me/following', () => {
    it('should allow only authenticated users', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/api/users/me/following',
      });
      expect(result.statusCode).toBe(403);
    });

    it('should throw on missing body', async () => {
      const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
      const result = await app.inject({
        method: 'POST',
        url: '/api/users/me/following',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
        payload: {},
      });
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.payload)).toEqual({
        error: 'Bad Request',
        message: [
          'stacksAddress must be a string',
          'createdAt must be an integer number',
        ],
        statusCode: 400,
      });
    });

    it('should create a follow', async () => {
      const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
      const stacksAddressToFollow = 'SP1TY00PDWJVNVEX7H7KJGS2K2YXHTQMY8C0G1NVP';
      let result = await app.inject({
        method: 'POST',
        url: '/api/users/me/following',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
        payload: {
          stacksAddress: stacksAddressToFollow,
          createdAt: Date.now(),
        },
      });
      expect(result.statusCode).toBe(200);

      result = await app.inject({
        method: 'GET',
        url: `/api/users/${stacksAddress}/following`,
      });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.payload)).toEqual([
        stacksAddressToFollow,
        'SP24GYRG3M7T0S6FZE9RVVP9PNNZQJQ614650G590',
      ]);

      // Cleanup
      result = await app.inject({
        method: 'DELETE',
        url: '/api/users/me/following',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
        payload: {
          stacksAddress: stacksAddressToFollow,
        },
      });
      expect(result.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/users/me/following', () => {
    it('should allow only authenticated users', async () => {
      const result = await app.inject({
        method: 'DELETE',
        url: '/api/users/me/following',
      });
      expect(result.statusCode).toBe(403);
    });

    it('should throw on missing body', async () => {
      const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
      const result = await app.inject({
        method: 'DELETE',
        url: '/api/users/me/following',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
        payload: {},
      });
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.payload)).toEqual({
        error: 'Bad Request',
        message: ['stacksAddress must be a string'],
        statusCode: 400,
      });
    });

    it('should delete a follow', async () => {
      const stacksAddress = 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q';
      const stacksAddressToFollow = 'SP1TY00PDWJVNVEX7H7KJGS2K2YXHTQMY8C0G1NVP';
      let result = await app.inject({
        method: 'POST',
        url: '/api/users/me/following',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
        payload: {
          stacksAddress: stacksAddressToFollow,
          createdAt: Date.now(),
        },
      });
      expect(result.statusCode).toBe(200);

      result = await app.inject({
        method: 'DELETE',
        url: '/api/users/me/following',
        cookies: {
          'next-auth.session-token': stacksAddress,
        },
        payload: {
          stacksAddress: stacksAddressToFollow,
        },
      });
      expect(result.statusCode).toBe(200);

      result = await app.inject({
        method: 'GET',
        url: `/api/users/${stacksAddress}/following`,
      });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.payload)).toEqual([
        'SP24GYRG3M7T0S6FZE9RVVP9PNNZQJQ614650G590',
      ]);
    });
  });
});
