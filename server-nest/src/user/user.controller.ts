import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth.guard';
import { CreateUserFollowDto } from './dto/createUserFollow.dto';
import { ExploreQuery } from './dto/exploreQuery.dto';
import { ExploreResponse } from './dto/exploreResponse.dto';
import { ExploreUser } from './dto/exploreUser.dto';
import { UserProfileDto } from './dto/userProfile.dto';
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
    description: 'Return the current logged in user.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    type: ExploreUser,
  })
  @UseGuards(AuthGuard)
  @Get('/api/users/me')
  getUserMe(@Request() req): Promise<ExploreUser> {
    return this.userService.getUserMe({ stacksAddress: req.address });
  }

  @ApiOperation({
    description: 'Return a user for a given stacks address.',
  })
  @ApiOkResponse({
    type: UserProfileDto,
  })
  @Get('/api/users/:userAddress')
  getUser(
    @Request() request,
    @Param('userAddress') userAddress: string,
  ): Promise<UserProfileDto> {
    return this.userService.getUser({ request, userAddress });
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

  @ApiOperation({
    description: 'Allows a user to follow another user.',
  })
  @ApiOkResponse({})
  @Post('/api/users/me/following')
  addFollow(
    @Request() req,
    @Body() createUserFollowDto: CreateUserFollowDto,
  ): Promise<void> {
    return this.userService.addFollow({
      followerAddress: req.address,
      followingAddress: createUserFollowDto.stacksAddress,
      createdAt: createUserFollowDto.createdAt,
    });
  }
}
