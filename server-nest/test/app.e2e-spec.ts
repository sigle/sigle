import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('user', () => {
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
