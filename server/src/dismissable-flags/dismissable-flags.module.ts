import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DismissableFlagsController } from './dismissable-flags.controller';
import { DismissableFlagsService } from './dismissable-flags.service';

@Module({
  controllers: [DismissableFlagsController],
  providers: [DismissableFlagsService, PrismaService],
})
export class DismissableFlagsModule {}
