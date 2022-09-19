import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async explore({ page }: { page: number }) {
    if (!page || page === 0) {
      page = 1;
    }
    const pageSize = 50;

    const users = await this.prisma.user.findMany({
      orderBy: { followers: { _count: 'desc' } },
      skip: pageSize * (page - 1),
      take: pageSize,
      select: {
        id: true,
        stacksAddress: true,
      },
    });
    const usersCount = await this.prisma.user.count({});
    const nextPage = usersCount > pageSize * page ? page + 1 : null;

    return { data: users, nextPage };
  }

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
