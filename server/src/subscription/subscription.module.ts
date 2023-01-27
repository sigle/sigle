import { Module } from '@nestjs/common';
import { PosthogModule } from '../posthog/posthog.module';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  imports: [PosthogModule],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
