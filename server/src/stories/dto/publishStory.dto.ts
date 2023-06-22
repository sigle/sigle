import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class PublishStoryDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsBoolean()
  @ApiProperty()
  send: boolean;
}
