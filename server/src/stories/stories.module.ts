import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';

@Module({
  controllers: [StoriesController],
  providers: [StoriesService],
})
export class StoriesModule {}
