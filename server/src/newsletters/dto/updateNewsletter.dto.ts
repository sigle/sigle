import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNewsletterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  apiSecret: string;
}
