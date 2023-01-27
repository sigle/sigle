import { Module } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { SubscribersController } from './subscribers.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PosthogModule } from '../posthog/posthog.module';

@Module({
  controllers: [SubscribersController],
  providers: [SubscribersService],
  imports: [PrismaModule, PosthogModule],
})
export class SubscribersModule {}
