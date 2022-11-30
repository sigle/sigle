import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionDto } from '../../subscription/dto/subscription.dto';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  stacksAddress: string;

  @ApiProperty()
  followersCount: number;

  @ApiProperty()
  followingCount: number;

  @ApiProperty({ type: SubscriptionDto })
  subscription: SubscriptionDto;
}
