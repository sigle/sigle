import { Module } from '@nestjs/common';
import { StacksService } from '../stacks/stacks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionService } from '../subscription/subscription.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PlausibleService } from '../plausible/plausible.service';

@Module({
  controllers: [AnalyticsController],
  providers: [
    StacksService,
    PlausibleService,
    SubscriptionService,
    AnalyticsService,
  ],
  imports: [PrismaModule],
})
export class AnalyticsModule {}
