import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class AddEmailDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}
