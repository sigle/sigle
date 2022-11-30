import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth.guard';
import { DismissableFlagsService } from './dismissable-flags.service';
import { DismissableFlags } from './dto/dismissable-flags.dto';
import { UpdateDismissableFlagsDto } from './dto/update-dismissable-flags.dto';

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
  getUserDismissableFlags(@Request() req): Promise<DismissableFlags> {
    return this.dismissableFlagsService.getUserDismissableFlags({
      stacksAddress: req.user.stacksAddress,
    });
  }

  @ApiOperation({
    description: 'Update the dismissable flags for the authenticated user.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    type: DismissableFlags,
  })
  @UseGuards(AuthGuard)
  @Post('/api/users/me/dismissable-flags')
  updateUserDismissableFlags(
    @Request() req,
    @Body() updateDismissableFlagsDto: UpdateDismissableFlagsDto,
  ): Promise<DismissableFlags> {
    return this.dismissableFlagsService.updateUserDismissableFlags({
      stacksAddress: req.user.stacksAddress,
      dismissableFlag: updateDismissableFlagsDto.dismissableFlag,
    });
  }
}
