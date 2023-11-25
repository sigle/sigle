import { ApiProperty } from '@nestjs/swagger';

export class DomainEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  domain: string;
}

export class DomainVerifyEntity {
  @ApiProperty({ enum: ['misconfigured', 'verified'] })
  status: 'misconfigured' | 'verified';
}
