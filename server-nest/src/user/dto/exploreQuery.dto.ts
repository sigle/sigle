import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class ExploreQuery {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  page: number;
}
