import { Module } from '@nestjs/common';
import { NewslettersService } from './newsletters.service';
import { NewslettersController } from './newsletters.controller';
import { SubscriptionService } from '../subscription/subscription.service';

@Module({
  controllers: [NewslettersController],
  providers: [NewslettersService, SubscriptionService],
  imports: [],
})
export class NewslettersModule {}
