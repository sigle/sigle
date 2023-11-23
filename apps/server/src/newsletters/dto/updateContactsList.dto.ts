import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateContactsListDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  listId: number;
}
