import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('user')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/api/users/:userAddress/followers')
  getUserFollowers(@Param('userAddress') userAddress: string) {
    return this.userService.getUserFollowers({ userAddress });
  }

  @Get('/api/users/:userAddress/following')
  getUserFollowing(@Param('userAddress') userAddress: string) {
    return this.userService.getUserFollowing({ userAddress });
  }
}
