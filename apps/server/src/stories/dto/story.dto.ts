import { ApiProperty } from '@nestjs/swagger';

class EmailDto {
  @ApiProperty()
  id: string;
}

export class StoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  publishedAt: Date;

  @ApiProperty()
  unpublishedAt: Date;

  @ApiProperty()
  deletedAt: Date;

  @ApiProperty({ nullable: true })
  email?: EmailDto;
}
