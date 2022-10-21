import { Module } from '@nestjs/common';
import { StacksService } from 'src/stacks/stacks.service';
import { PrismaService } from '../prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, StacksService],
})
export class UserModule {}
