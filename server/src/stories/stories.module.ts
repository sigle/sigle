import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { StacksService } from '../stacks/stacks.service';
import { EmailModule } from '../email/email.module';
import { PosthogModule } from '../posthog/posthog.module';

@Module({
  controllers: [StoriesController],
  providers: [StoriesService, StacksService],
  imports: [EmailModule, PosthogModule],
})
export class StoriesModule {}
