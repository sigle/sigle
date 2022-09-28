import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class CreateSubscriptionCreatorPlusDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3000)
  @ApiProperty()
  nftId: number;
}
