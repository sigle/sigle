import { Module } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { SubscribersController } from './subscribers.controller';

@Module({
  controllers: [SubscribersController],
  providers: [SubscribersService],
  imports: [],
})
export class SubscribersModule {}
