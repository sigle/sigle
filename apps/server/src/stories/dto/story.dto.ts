import { ApiProperty } from '@nestjs/swagger';

class EmailDto {
  @ApiProperty()
  id: string;
}

export class StoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  publishedAt: Date | null;

  @ApiProperty({ nullable: true })
  unpublishedAt: Date | null;

  @ApiProperty({ nullable: true })
  deletedAt: Date | null;

  @ApiProperty({ nullable: true })
  email: EmailDto | null;
}
