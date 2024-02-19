import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { AuthGuard, AuthenticatedRequest } from '../auth.guard';
import { CreateUserFollowDto } from './dto/createUserFollow.dto';
import { DeleteUserFollowDto } from './dto/deleteUserFollow.dto';
import { ExploreQuery } from './dto/exploreQuery.dto';
import { ExploreResponse } from './dto/exploreResponse.dto';
import { UserMeProfileEntity } from './entities/userMeProfile.entity';
import { UserProfileEntity } from './entities/userProfile.entity';
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
    type: UserMeProfileEntity,
  })
  @UseGuards(AuthGuard)
  @Get('/api/users/me')
  getUserMe(
    @Request() req: AuthenticatedRequest,
  ): Promise<UserMeProfileEntity> {
    return this.userService.getUserMe({
      stacksAddress: req.user.stacksAddress,
    });
  }

  @ApiOperation({
    description: 'Return a user for a given stacks address.',
  })
  @ApiOkResponse({
    type: UserProfileEntity,
  })
  @Get('/api/users/:userAddress')
  getUser(
    @Request() request: AuthenticatedRequest,
    @Param('userAddress') userAddress: string,
  ): Promise<UserProfileEntity> {
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
  @ApiBearerAuth()
  @ApiOkResponse({ type: Boolean })
  @UseGuards(AuthGuard)
  @Post('/api/users/me/following')
  @HttpCode(200)
  addFollow(
    @Request() req: AuthenticatedRequest,
    @Body() createUserFollowDto: CreateUserFollowDto,
  ): Promise<void> {
    return this.userService.addFollow({
      followerAddress: req.user.stacksAddress,
      followingAddress: createUserFollowDto.stacksAddress,
      createdAt: createUserFollowDto.createdAt,
    });
  }

  @ApiOperation({
    description: 'Allows a user to unfollow another user.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: Boolean })
  @UseGuards(AuthGuard)
  @Delete('/api/users/me/following')
  removeFollow(
    @Request() req: AuthenticatedRequest,
    @Body() deleteUserFollowDto: DeleteUserFollowDto,
  ): Promise<void> {
    return this.userService.removeFollow({
      followerAddress: req.user.stacksAddress,
      followingAddress: deleteUserFollowDto.stacksAddress,
    });
  }
}
