import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class CreateUserFollowDto {
  @IsString()
  @ApiProperty()
  stacksAddress: string;

  @Type(() => Number)
  @IsInt()
  @ApiProperty()
  createdAt: number;
}
