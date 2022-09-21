import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getToken } from 'next-auth/jwt';
import { EnvironmentVariables } from '../environment/environment.validation';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private prisma: PrismaService,
  ) {}

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

  async getUserMe({ stacksAddress }: { stacksAddress: string }) {
    const userSelectFields = {
      id: true,
      stacksAddress: true,
    };
    let loggedInUser = await this.prisma.user.findUnique({
      where: { stacksAddress },
      select: userSelectFields,
    });

    if (!loggedInUser) {
      loggedInUser = await this.prisma.user.create({
        data: {
          stacksAddress,
        },
        select: userSelectFields,
      });
    }

    return loggedInUser;
  }

  async getUser({
    request,
    userAddress,
  }: {
    request: any;
    userAddress: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { stacksAddress: userAddress },
      select: {
        id: true,
        stacksAddress: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        subscriptions: {
          select: {
            id: true,
            nftId: true,
          },
          where: {
            status: 'ACTIVE',
          },
          take: 1,
        },
      },
    });

    /**
     * If user is not found in database, it means it's a legacy user using blockstack connect.
     * As we can't create sessions for these kind of users, we check if the current user is logged in
     * and add the legacy user to the database if it's the case.
     */
    if (!user) {
      // TODO validate address format
      const token = await getToken({
        req: request,
        secret: this.configService.get('NEXTAUTH_SECRET'),
      });
      if (token && token.sub) {
        const newUser = await this.prisma.user.create({
          data: {
            stacksAddress: userAddress,
            isLegacy: true,
          },
          select: { id: true, stacksAddress: true },
        });
        return {
          ...newUser,
          followersCount: 0,
          followingCount: 0,
          subscription: null,
        };
      }
    }

    return user
      ? {
          id: user.id,
          stacksAddress: user.stacksAddress,
          subscription: user.subscriptions[0],
          followersCount: user._count.followers,
          followingCount: user._count.following,
        }
      : null;
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
