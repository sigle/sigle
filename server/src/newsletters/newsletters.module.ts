import { Module } from '@nestjs/common';
import { NewslettersService } from './newsletters.service';
import { NewslettersController } from './newsletters.controller';

@Module({
  controllers: [NewslettersController],
  providers: [NewslettersService],
})
export class NewslettersModule {}
