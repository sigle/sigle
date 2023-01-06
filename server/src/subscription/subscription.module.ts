import { Module } from '@nestjs/common';
import { PosthogModule } from '../posthog/posthog.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  imports: [PrismaModule, PosthogModule],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
