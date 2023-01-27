import { Module } from '@nestjs/common';
import { StacksService } from '../stacks/stacks.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, StacksService],
  imports: [],
})
export class UserModule {}
