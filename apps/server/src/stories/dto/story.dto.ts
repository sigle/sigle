import { ApiProperty } from '@nestjs/swagger';

class EmailDto {
  @ApiProperty()
  id: string;
}

export class StoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: 'string', nullable: true })
  publishedAt: Date | null;

  @ApiProperty({ type: 'string', nullable: true })
  unpublishedAt: Date | null;

  @ApiProperty({ type: 'string', nullable: true })
  deletedAt: Date | null;

  @ApiProperty({ type: 'string', nullable: true })
  email: EmailDto | null;
}
