import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateSenderDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  senderId: number;
}
