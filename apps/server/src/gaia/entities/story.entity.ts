import { ApiProperty } from '@nestjs/swagger';

export class StoryEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ nullable: true })
  contentVersion?: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ nullable: true })
  coverImage?: string;

  @ApiProperty({ nullable: true })
  metaTitle?: string;

  @ApiProperty({ nullable: true })
  metaDescription?: string;

  @ApiProperty({ nullable: true })
  metaImage?: string;

  @ApiProperty({ nullable: true })
  canonicalUrl?: string;

  @ApiProperty({ type: Boolean, nullable: true })
  featured?: boolean;

  @ApiProperty({ type: Boolean, nullable: true })
  hideCoverImage?: boolean;

  @ApiProperty()
  createdAt: number;

  @ApiProperty()
  updatedAt: number;
}
