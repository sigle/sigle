import { ApiProperty } from '@nestjs/swagger';

export class ContactsListsEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isSelected: boolean;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  subscriberCount: number;
}
