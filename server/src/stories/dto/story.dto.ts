import { ApiProperty } from '@nestjs/swagger';

export class StoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  publishedAt: Date;

  @ApiProperty()
  sentAt: Date;

  @ApiProperty()
  unpublishedAt: Date;

  @ApiProperty()
  deletedAt: Date;
}
