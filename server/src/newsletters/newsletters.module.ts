import { Module } from '@nestjs/common';
import { NewslettersService } from './newsletters.service';
import { NewslettersController } from './newsletters.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [NewslettersController],
  providers: [NewslettersService],
  imports: [PrismaModule],
})
export class NewslettersModule {}
