import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @IsString()
  @ApiProperty({ description: 'The Stacks address to subscribe to.' })
  stacksAddress: string;

  @IsEmail()
  @ApiProperty()
  email: string;
}
