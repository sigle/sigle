import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { ExploreQuery } from './dto/exploreQuery.dto';
import { ExploreResponse } from './dto/exploreResponse.dto';
import { ExploreUser } from './dto/exploreUser.dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    description: 'Return a list of users using Sigle.',
  })
  @ApiOkResponse({
    description: 'The users using Sigle.',
    type: ExploreResponse,
  })
  @Get('/api/users/explore')
  explore(@Query() query: ExploreQuery): Promise<ExploreResponse> {
    return this.userService.explore({ page: query.page });
  }

  @ApiOperation({
    description:
      'Returns a list of users who are followers of the specified user.',
  })
  @ApiOkResponse({
    description: 'The users who are following a user.',
    type: String,
    isArray: true,
  })
  @Get('/api/users/:userAddress/followers')
  getUserFollowers(
    @Param('userAddress') userAddress: string,
  ): Promise<string[]> {
    return this.userService.getUserFollowers({ userAddress });
  }

  @ApiOperation({
    description: 'Returns a list of users the specified user is following.',
  })
  @ApiOkResponse({
    description: 'The users a user is following.',
    type: String,
    isArray: true,
  })
  @Get('/api/users/:userAddress/following')
  getUserFollowing(
    @Param('userAddress') userAddress: string,
  ): Promise<string[]> {
    return this.userService.getUserFollowing({ userAddress });
  }
}
