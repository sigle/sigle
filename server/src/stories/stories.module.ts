import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { StacksService } from '../stacks/stacks.service';
import { BulkEmailModule } from '../bulkEmail/bulkEmail.module';

@Module({
  controllers: [StoriesController],
  providers: [StoriesService, StacksService],
  imports: [BulkEmailModule],
})
export class StoriesModule {}
