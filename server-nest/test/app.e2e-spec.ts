import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  describe('user', () => {
    it('/api/users/explore (GET)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/explore?page=1')
        .expect(200);
      expect(response.body.nextPage).toBe(2);
      expect(response.body.data.length).toBe(50);
    });

    it('/api/users/:userAddress/followers (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/users/SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q/followers')
        .expect(200)
        .expect([
          'SP24GYRG3M7T0S6FZE9RVVP9PNNZQJQ614650G590',
          'SP1Y6ZAD2ZZFKNWN58V8EA42R3VRWFJSGWFAD9C36',
        ]);
    });

    it('/api/users/:userAddress/following (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/users/SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q/following')
        .expect(200)
        .expect(['SP24GYRG3M7T0S6FZE9RVVP9PNNZQJQ614650G590']);
    });
  });
});
