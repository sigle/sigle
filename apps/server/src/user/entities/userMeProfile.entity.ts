import { ApiProperty } from '@nestjs/swagger';

class PublicNewsletterEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;
}

export class UserMeProfileEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  stacksAddress: string;

  @ApiProperty({ type: 'string', nullable: true })
  email: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  emailVerified: Date | null;

  @ApiProperty({ type: PublicNewsletterEntity, nullable: true })
  newsletter: PublicNewsletterEntity | null;
}
