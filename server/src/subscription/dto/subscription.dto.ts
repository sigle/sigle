import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nftId: number;
}
