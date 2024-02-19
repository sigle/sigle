import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { EnvironmentVariables } from '../environment/environment.validation';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  public redis: Redis;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async onModuleInit() {
    if (!this.redis) {
      this.redis = new Redis(
        this.configService.get('REDIS_DATABASE_URL') as string,
      );
    }
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
