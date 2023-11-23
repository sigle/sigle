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

  @ApiProperty()
  email: string;

  @ApiProperty()
  emailVerified: Date;

  @ApiProperty({ type: PublicNewsletterEntity, nullable: true })
  newsletter?: PublicNewsletterEntity;
}
