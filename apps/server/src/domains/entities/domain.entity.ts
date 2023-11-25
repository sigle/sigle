import { ApiProperty } from '@nestjs/swagger';

export class DomainEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  domain: string;
}
