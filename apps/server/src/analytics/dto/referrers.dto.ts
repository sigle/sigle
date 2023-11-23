import { ApiProperty } from '@nestjs/swagger';

export class ReferrerDto {
  @ApiProperty()
  domain: string;

  @ApiProperty()
  count: number;
}
