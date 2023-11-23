import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionDto } from '../../subscription/dto/subscription.dto';

class PublicNewsletterEntity {
  @ApiProperty()
  id: string;
}

export class UserProfileEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  stacksAddress: string;

  @ApiProperty()
  followersCount: number;

  @ApiProperty()
  followingCount: number;

  @ApiProperty({ type: SubscriptionDto, nullable: true })
  subscription?: SubscriptionDto;

  @ApiProperty({ type: PublicNewsletterEntity, nullable: true })
  newsletter?: PublicNewsletterEntity;
}
