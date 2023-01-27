import { Module } from '@nestjs/common';
import { StacksService } from '../stacks/stacks.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PosthogModule } from '../posthog/posthog.module';
import { EmailVerificationService } from '../email-verification/email-verification.service';

@Module({
  controllers: [UserController],
  providers: [UserService, StacksService, EmailVerificationService],
  imports: [PrismaModule, PosthogModule],
})
export class UserModule {}
