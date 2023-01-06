import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateNewsletterDto {
  @IsBoolean()
  @ApiProperty()
  enabled: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  apiSecret: string;
}
