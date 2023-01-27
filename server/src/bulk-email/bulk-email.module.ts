import { Module } from '@nestjs/common';
import { BulkEmailService } from './bulk-email.service';

@Module({
  providers: [BulkEmailService],
  exports: [BulkEmailService],
})
export class BulkEmailModule {}
