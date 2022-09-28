import { ApiProperty } from '@nestjs/swagger';

export class ExploreUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  stacksAddress: string;
}
