import { ApiProperty } from '@nestjs/swagger';

class AnalyticsHistoricalDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  visits: number;

  @ApiProperty()
  pageviews: number;
}

class AnalyticsStoryDto {
  @ApiProperty()
  pathname: string;

  @ApiProperty()
  visits: number;

  @ApiProperty()
  pageviews: number;
}

export class HistoricalDto {
  @ApiProperty({ type: AnalyticsHistoricalDto, isArray: true })
  historical: AnalyticsHistoricalDto[];

  @ApiProperty({ type: AnalyticsStoryDto, isArray: true })
  stories: AnalyticsStoryDto[];
}
