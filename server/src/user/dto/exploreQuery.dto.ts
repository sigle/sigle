import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ExploreQuery {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  page: number;
}
