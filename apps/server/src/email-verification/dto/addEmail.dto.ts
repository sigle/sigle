import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}
