import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard, AuthenticatedRequest } from '../auth.guard';
import { AnalyticsService } from './analytics.service';
import { HistoricalDto } from './dto/historical.dto';
import { HistoricalQueryDto } from './dto/historicalQuery.dto';
import { ReferrerDto } from './dto/referrers.dto';
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
    type: ReferrerDto,
    isArray: true,
    schema: {
      example: [
        { domain: 'twitter.com', count: 5 },
        { domain: 'google.com', count: 2 },
      ],
    },
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(AuthGuard)
  @Get('/api/analytics/referrers')
  getReferrers(
    @Request() req: AuthenticatedRequest,
    @Query() query: ReferrersQueryDto,
  ): Promise<ReferrerDto[]> {
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
    type: HistoricalDto,
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
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(AuthGuard)
  @Get('/api/analytics/historical')
  getHistorical(
    @Request() req: AuthenticatedRequest,
    @Query() query: HistoricalQueryDto,
  ): Promise<HistoricalDto> {
    return this.analyticsService.historical({
      stacksAddress: req.user.stacksAddress,
      dateFrom: query.dateFrom,
      dateGrouping: query.dateGrouping,
      storyId: query.storyId,
    });
  }
}
