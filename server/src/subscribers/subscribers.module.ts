import { Module } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { SubscribersController } from './subscribers.controller';
import { PosthogModule } from '../posthog/posthog.module';

@Module({
  controllers: [SubscribersController],
  providers: [SubscribersService],
  imports: [PosthogModule],
})
export class SubscribersModule {}
