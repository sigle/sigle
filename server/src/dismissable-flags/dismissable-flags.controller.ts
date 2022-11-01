import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth.guard';
import { DismissableFlagsService } from './dismissable-flags.service';
import { DismissableFlags } from './dto/dismissable-flags.dto';

@Controller()
export class DismissableFlagsController {
  constructor(
    private readonly dismissableFlagsService: DismissableFlagsService,
  ) {}

  @ApiOperation({
    description: 'Return the dismissable flags for the authenticated user.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    type: DismissableFlags,
  })
  @UseGuards(AuthGuard)
  @Get('/api/users/me/dismissable-flags')
  explore(@Request() req): Promise<DismissableFlags> {
    return this.dismissableFlagsService.getUserDismissableFlags({
      stacksAddress: req.user.stacksAddress,
    });
  }
}
