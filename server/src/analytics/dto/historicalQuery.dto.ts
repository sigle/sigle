import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class HistoricalQueryDto {
  @ApiProperty({
    description: 'The date from which to get the statistics (e.g. 2022-04-01).',
  })
  @IsString()
  dateFrom: string;

  @ApiProperty({
    description:
      'The date grouping (e.g. day, month). When day is set the date format is YYYY-MM-DD. When month is set the date format is YYYY-MM.',
  })
  @IsString()
  dateGrouping: string;

  @ApiPropertyOptional({
    description: 'The story id to get the statistics for.',
  })
  @IsOptional()
  @IsString()
  storyId?: string;
}
