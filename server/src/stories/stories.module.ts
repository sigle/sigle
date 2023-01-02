import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StacksService } from '../stacks/stacks.service';
import { EmailModule } from '../email/email.module';

@Module({
  controllers: [StoriesController],
  providers: [StoriesService, StacksService],
  imports: [PrismaModule, EmailModule],
})
export class StoriesModule {}
