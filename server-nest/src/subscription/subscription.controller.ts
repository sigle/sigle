import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth.guard';
import { SubscriptionDto } from './dto/subscription.dto';
import { SubscriptionService } from './subscription.service';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiOperation({
    description:
      'Return the current active subscription of the current logged in user.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Returns the current active subscription object. If no active subscription is found, null is returned.',
    type: SubscriptionDto,
  })
  @UseGuards(AuthGuard)
  @Get('/api/subscriptions')
  getUserMe(@Request() req): Promise<SubscriptionDto> {
    return this.subscriptionService.getUserActiveSubscription({
      stacksAddress: req.address,
    });
  }
}
