import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class UpdateNewsletterDto {
  @IsBoolean()
  @ApiProperty()
  enabled: boolean;

  @IsString()
  @ApiProperty()
  apiKey: string;

  @IsString()
  @ApiProperty()
  apiSecret: string;
}
