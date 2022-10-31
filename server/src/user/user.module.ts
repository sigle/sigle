import { Module } from '@nestjs/common';
import { StacksService } from '../stacks/stacks.service';
import { PrismaService } from '../prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    StacksService,
    EmailVerificationService,
  ],
})
export class UserModule {}
