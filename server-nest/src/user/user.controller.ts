import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('user')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  getUserFollowers(@Param('userAddress') userAddress: string) {
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
  getUserFollowing(@Param('userAddress') userAddress: string) {
    return this.userService.getUserFollowing({ userAddress });
  }
}
