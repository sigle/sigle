import { ApiProperty } from '@nestjs/swagger';

export class UserInfoEntity {
  @ApiProperty()
  username: string;

  @ApiProperty()
  address: string;
}
