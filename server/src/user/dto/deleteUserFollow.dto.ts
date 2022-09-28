import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteUserFollowDto {
  @IsString()
  @ApiProperty()
  stacksAddress: string;
}
