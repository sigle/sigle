import { Module } from '@nestjs/common';
import { BulkEmailService } from './bulkEmail.service';

@Module({
  providers: [BulkEmailService],
  exports: [BulkEmailService],
})
export class BulkEmailModule {}
