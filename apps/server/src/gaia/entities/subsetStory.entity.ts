import { ApiProperty } from '@nestjs/swagger';

export class SubsetStoryEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ nullable: true })
  coverImage?: string;

  @ApiProperty({ type: Boolean, nullable: true })
  featured?: boolean;

  @ApiProperty()
  createdAt: number;

  @ApiProperty()
  updatedAt: number;
}
