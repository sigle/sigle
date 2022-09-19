import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

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

  // Auto validate schemas in body etc..
  // https://docs.nestjs.com/techniques/validation#auto-validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Prisma interferes with NestJS enableShutdownHooks, we shutdown prisma gracefully to avoid side effects
  // https://docs.nestjs.com/recipes/prisma#issues-with-enableshutdownhooks
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const configService = app.get(ConfigService<{ PORT: string }>);
  await app.listen(configService.get('PORT') || 3000);
}

bootstrap();
