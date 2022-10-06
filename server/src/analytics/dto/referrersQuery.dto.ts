import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ReferrersQueryDto {
  @ApiProperty({
    description: 'The date from which to get the statistics (e.g. 2022-04-01).',
  })
  @IsString()
  dateFrom: string;

  @ApiPropertyOptional({
    description: 'The story id to get the statistics for.',
  })
  @IsOptional()
  @IsString()
  storyId?: string;
}
