import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth.guard';
import { AnalyticsService } from './analytics.service';
import { ReferrersQueryDto } from './dto/referrersQuery.dto';

@ApiTags('analytics')
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}
  @ApiOperation({
    description: 'Return the referrer statistics.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      example: [
        { domain: 'twitter.com', count: 5 },
        { domain: 'google.com', count: 2 },
      ],
    },
  })
  @UseGuards(AuthGuard)
  @Get('/api/analytics/referrers')
  getReferrers(@Request() req, @Query() query: ReferrersQueryDto) {
    return this.analyticsService.referrers({
      stacksAddress: req.user.stacksAddress,
      dateFrom: query.dateFrom,
      storyId: query.storyId,
    });
  }
}
