import { CacheModule, HttpException, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SentryInterceptor, SentryModule } from '@ntegral/nestjs-sentry';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import * as redisStore from 'cache-manager-redis-store';
import type { ClientOpts } from 'redis';
import { validate } from './environment/environment.validation';
import { UserModule } from './user/user.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PrismaService } from './prisma.service';
import { AnalyticsModule } from './analytics/analytics.module';
import { PlausibleService } from './plausible/plausible.service';
import { StacksService } from './stacks/stacks.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      cache: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    SentryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dsn: config.get('SENTRY_DSN'),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: 60,
        limit: config.get('NODE_ENV') === 'test' ? 1000 : 50,
        storage: new ThrottlerStorageRedisService(
          config.get('REDIS_DATABASE_URL'),
        ),
        ignoreUserAgents:
          config.get('NODE_ENV') === 'test' ? [/sigletests/gi] : [],
      }),
    }),
    CacheModule.registerAsync<ClientOpts>({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        url: config.get('REDIS_DATABASE_URL'),
      }),
    }),
    UserModule,
    SubscriptionModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      // Report the HttpException to sentry
      // We filter to only send the one that are 500
      provide: APP_INTERCEPTOR,
      useFactory: () =>
        new SentryInterceptor({
          user: ['stacksAddress'],
          filters: [
            {
              type: HttpException,
              filter: (exception: HttpException) =>
                exception.getStatus() === 500,
            },
          ],
        }),
    },
    PrismaService,
    StacksService,
    PlausibleService,
  ],
})
export class AppModule {}
