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
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { AuthGuard } from '../auth.guard';
import { CreateUserFollowDto } from './dto/createUserFollow.dto';
import { DeleteUserFollowDto } from './dto/deleteUserFollow.dto';
import { ExploreQuery } from './dto/exploreQuery.dto';
import { ExploreResponse } from './dto/exploreResponse.dto';
import { ExploreUser } from './dto/exploreUser.dto';
import { UserProfileDto } from './dto/userProfile.dto';
import { UserService } from './user.service';
import { AddEmailDto } from './dto/addEmail.dto';

@ApiTags('user')
@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

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
    return this.userService.getUserMe({
      stacksAddress: req.user.stacksAddress,
    });
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
  @ApiBearerAuth()
  @ApiOkResponse({ type: Boolean })
  @UseGuards(AuthGuard)
  @Post('/api/users/me/following')
  @HttpCode(200)
  addFollow(
    @Request() req,
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
    @Request() req,
    @Body() deleteUserFollowDto: DeleteUserFollowDto,
  ): Promise<void> {
    return this.userService.removeFollow({
      followerAddress: req.user.stacksAddress,
      followingAddress: deleteUserFollowDto.stacksAddress,
    });
  }

  @ApiOperation({
    description: 'Add an email address for the authenticated user.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: Boolean })
  @UseGuards(AuthGuard)
  @Post('/api/users/me/email')
  @HttpCode(200)
  async addEmail(
    @Request() req,
    @Body() addEmailDto: AddEmailDto,
  ): Promise<void> {
    // TODO rate limit
    // TODO validate email is valid - check blocksurvey tools
    // TODO another user already has this email setup

    await this.userService.addOrUpdateEmail({
      stacksAddress: req.user.stacksAddress,
      email: addEmailDto.email,
    });
    await this.emailVerificationService.sendVerificationLink({
      email: addEmailDto.email,
    });
  }
}
