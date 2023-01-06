import { Module } from '@nestjs/common';
import { StacksService } from '../stacks/stacks.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PosthogModule } from '../posthog/posthog.module';

@Module({
  controllers: [UserController],
  providers: [UserService, StacksService],
  imports: [PrismaModule, PosthogModule],
})
export class UserModule {}
