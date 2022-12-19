import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UnpublishStoryDto {
  @IsString()
  @ApiProperty()
  id: string;
}
