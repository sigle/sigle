import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth.guard';
import { AnalyticsService } from './analytics.service';
import { HistoricalQueryDto } from './dto/historicalQuery.dto';
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

  @ApiOperation({
    description: 'Return the historical statistics.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      example: {
        historical: [
          {
            date: '2022-03',
            visits: 0,
            pageviews: 0,
          },
          {
            date: '2022-04',
            visits: 0,
            pageviews: 0,
          },
        ],
        stories: [
          { pathname: 'zsoVIi3V6CE', visits: 0, pageviews: 0 },
          { pathname: '0jE9PPqbxUp', visits: 0, pageviews: 0 },
        ],
      },
    },
  })
  @UseGuards(AuthGuard)
  @Get('/api/analytics/historical')
  getHistorical(@Request() req, @Query() query: HistoricalQueryDto) {
    return this.analyticsService.historical({
      stacksAddress: req.user.stacksAddress,
      dateFrom: query.dateFrom,
      dateGrouping: query.dateGrouping,
      storyId: query.storyId,
    });
  }
}
