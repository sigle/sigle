import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendTestStoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  emails: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  storyTitle: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  storyContent: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true })
  storyCoverImage: string;
}
