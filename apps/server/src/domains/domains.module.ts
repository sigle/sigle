import { Module } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { DomainsController } from './domains.controller';
import { SubscriptionService } from '../subscription/subscription.service';

@Module({
  controllers: [DomainsController],
  providers: [DomainsService, SubscriptionService],
  imports: [],
})
export class DomainsModule {}
