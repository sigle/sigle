import {
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard, AuthenticatedRequest } from '../auth.guard';
import { SubscriptionDto } from './dto/subscription.dto';
import { SubscriptionService } from './subscription.service';

@ApiTags('subscription')
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
  getUserMe(
    @Request() req: AuthenticatedRequest,
  ): Promise<SubscriptionDto | null> {
    return this.subscriptionService.getUserActiveSubscription({
      stacksAddress: req.user.stacksAddress,
    });
  }

  @ApiOperation({
    description:
      'Create or update a creator plus subscription on the current logged in user. A user can only have one active subscription at a time.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the newly created subscription object.',
    type: SubscriptionDto,
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(AuthGuard)
  @Post('/api/subscriptions/syncWithNft')
  @HttpCode(200)
  syncSubscriptionWithNft(
    @Request() req: AuthenticatedRequest,
  ): Promise<SubscriptionDto | null> {
    return this.subscriptionService.syncSubscriptionWithNft({
      stacksAddress: req.user.stacksAddress,
    });
  }
}
