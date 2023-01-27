import { Module } from '@nestjs/common';
import { NewslettersService } from './newsletters.service';
import { NewslettersController } from './newsletters.controller';
import { SubscriptionService } from '../subscription/subscription.service';
import { PosthogModule } from '../posthog/posthog.module';

@Module({
  controllers: [NewslettersController],
  providers: [NewslettersService, SubscriptionService],
  imports: [PosthogModule],
})
export class NewslettersModule {}
