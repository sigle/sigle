import fastifyCookie from '@fastify/cookie';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Headers } from 'undici';
import { AppModule } from './app.module';
import { sites } from './sites';

// next-auth workaround as node.js does not have the global Headers
// https://github.com/nextauthjs/next-auth/issues/4988
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.Headers = Headers;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger:
        process.env.NODE_ENV === 'development'
          ? ['error', 'warn', 'log', 'debug', 'verbose']
          : ['error', 'warn', 'log'],
    },
  );
  const configService = app.get(
    ConfigService<{
      PORT: string;
      NODE_ENV: string;
      APP_URL: string;
      NEXTAUTH_SECRET: string;
    }>,
  );

  // Swagger documentation used to generate the type safe client
  // Expose JSON route at /api/docs-json
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sigle API')
    // TODO get version from package.json
    .setVersion('0.1.0')
    .addTag('user', 'User related end-points')
    .addTag('subscription', 'Subscription related end-points')
    .addTag('analytics', 'Analytics related end-points')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const allowedSitesOrigins = Object.keys(sites).map(
    (site) => `https://${site}`,
  );

  // Enable cors so only requests from allowed domains can work
  // Cors is disabled for local env.
  // Cors is enabled on prod and allowed only for the APP_URL.
  // Allow the RENDER API to make calls, used to bypass CORS for the health check, in such case origin will be undefined.
  app.enableCors({
    credentials: true,
    origin: (origin, cb) => {
      if (
        configService.get('NODE_ENV') === 'development' ||
        origin === configService.get('APP_URL') ||
        allowedSitesOrigins.includes(origin) ||
        origin === undefined
      ) {
        cb(null, true);
        return;
      }
      cb(new Error('Not allowed'), false);
    },
  });

  // Parse the cookies sent by the web app for authentication.
  app.register(fastifyCookie as any, {
    secret: configService.get('NEXTAUTH_SECRET'),
  });

  // Auto validate schemas in body etc..
  // https://docs.nestjs.com/techniques/validation#auto-validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(configService.get('PORT') || 3000, '0.0.0.0');
}

bootstrap();
