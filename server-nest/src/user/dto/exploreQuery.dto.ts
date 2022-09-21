import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class ExploreQuery {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  page: number;
}
