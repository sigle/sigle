import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PublishStoryDto {
  @IsString()
  @ApiProperty()
  id: string;
}
