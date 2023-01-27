import { Module } from '@nestjs/common';
import { StacksService } from '../stacks/stacks.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PosthogModule } from '../posthog/posthog.module';

@Module({
  controllers: [UserController],
  providers: [UserService, StacksService],
  imports: [PosthogModule],
})
export class UserModule {}
