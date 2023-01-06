import { Module } from '@nestjs/common';
import { PosthogService } from './posthog.service';

@Module({
  providers: [PosthogService],
  exports: [PosthogService],
})
export class PosthogModule {}
