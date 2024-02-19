import { ApiProperty } from '@nestjs/swagger';
import { ExploreUser } from './exploreUser.dto';

export class ExploreResponse {
  @ApiProperty({ type: 'number', nullable: true })
  nextPage: number | null;

  @ApiProperty({ type: ExploreUser, isArray: true })
  data: ExploreUser[];
}
