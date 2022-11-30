import { Post, Body, Controller } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/createSubscriber.dto';

@ApiTags('subscribers')
@Controller()
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @ApiOperation({
    description: 'Create a new email subscriber.',
  })
  @Throttle(5, 60)
  @Post('/api/subscribers')
  create(@Body() createSubscriberDto: CreateSubscriberDto) {
    return this.subscribersService.create(createSubscriberDto);
  }
}
