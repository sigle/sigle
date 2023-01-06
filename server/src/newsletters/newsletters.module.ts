import { Module } from '@nestjs/common';
import { NewslettersService } from './newsletters.service';
import { NewslettersController } from './newsletters.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionService } from '../subscription/subscription.service';
import { PosthogModule } from '../posthog/posthog.module';

@Module({
  controllers: [NewslettersController],
  providers: [NewslettersService, SubscriptionService],
  imports: [PrismaModule, PosthogModule],
})
export class NewslettersModule {}
