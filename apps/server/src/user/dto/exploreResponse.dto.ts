import { ApiProperty } from '@nestjs/swagger';
import { ExploreUser } from './exploreUser.dto';

export class ExploreResponse {
  @ApiProperty()
  nextPage: number;

  @ApiProperty({ type: ExploreUser, isArray: true })
  data: ExploreUser[];
}
