import {
  Body,
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
import { AuthGuard } from '../auth.guard';
import { SubscriptionDto } from './dto/subscription.dto';
import { CreateSubscriptionCreatorPlusDto } from './dto/createSubscriptionCreatorPlus.dto';
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
  getUserMe(@Request() req): Promise<SubscriptionDto> {
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
  @Throttle(5, 60)
  @UseGuards(AuthGuard)
  @Post('/api/subscriptions/creatorPlus')
  @HttpCode(200)
  createSubscriptionCreatorPlus(
    @Request() req,
    @Body() createCatDto: CreateSubscriptionCreatorPlusDto,
  ): Promise<SubscriptionDto> {
    return this.subscriptionService.createSubscriptionCreatorPlus({
      stacksAddress: req.user.stacksAddress,
      nftId: createCatDto.nftId,
    });
  }
}
