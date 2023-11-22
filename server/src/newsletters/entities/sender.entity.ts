import { ApiProperty } from '@nestjs/swagger';

export class SenderEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  isSelected: boolean;
}
