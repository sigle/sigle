import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [StoriesController],
  providers: [StoriesService],
  imports: [PrismaModule],
})
export class StoriesModule {}
