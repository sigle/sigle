import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserFollowers({ userAddress }: { userAddress: string }) {
    const followers = await this.prisma.follows.findMany({
      where: {
        followingAddress: userAddress,
      },
      select: {
        followerAddress: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return followers.map((follower) => follower.followerAddress);
  }

  async getUserFollowing({ userAddress }: { userAddress: string }) {
    const followers = await this.prisma.follows.findMany({
      where: {
        followerAddress: userAddress,
      },
      select: {
        followingAddress: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return followers.map((follower) => follower.followingAddress);
  }
}
