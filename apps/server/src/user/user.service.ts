import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateStacksAddress } from '@stacks/transactions';
import { getToken } from 'next-auth/jwt';
import { fetch } from 'undici';
import { Prisma } from '.prisma/client';
import { InfoApi, Configuration } from '@stacks/blockchain-api-client';
import { EnvironmentVariables } from '../environment/environment.validation';
import { PrismaService } from '../prisma/prisma.service';
import { PosthogService } from '../posthog/posthog.service';

@Injectable()
export class UserService {
  private stacksInfoApi: InfoApi;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly prisma: PrismaService,
    private readonly posthog: PosthogService,
  ) {
    this.stacksInfoApi = new InfoApi(
      new Configuration({ fetchApi: fetch as any }),
    );
  }
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

  async createUser({
    stacksAddress,
    isLegacy,
    userSelectFields,
  }: {
    stacksAddress: string;
    isLegacy: boolean;
    userSelectFields: Prisma.UserSelect;
  }): Promise<any> {
    const data = await this.stacksInfoApi.getCoreApiInfo();
    return this.prisma.user.create({
      data: {
        stacksAddress,
        isLegacy,
        stacksBlock: data.burn_block_height,
      },
      select: userSelectFields,
    });
  }

  async getUserMe({ stacksAddress }: { stacksAddress: string }) {
    const userSelectFields = {
      id: true,
      stacksAddress: true,
      email: true,
      emailVerified: true,
      newsletter: {
        select: {
          id: true,
          status: true,
        },
      },
    };
    let loggedInUser = await this.prisma.user.findUnique({
      where: { stacksAddress },
      select: userSelectFields,
    });

    if (!loggedInUser) {
      loggedInUser = await this.createUser({
        stacksAddress,
        isLegacy: false,
        userSelectFields,
      });
    }

    return loggedInUser!;
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
          },
          where: {
            status: 'ACTIVE',
          },
          take: 1,
        },
        newsletter: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    /**
     * If user is not found in database, it means it's a legacy user using blockstack connect.
     * As we can't create sessions for these kind of users, we check if the current user is logged in
     * and add the legacy user to the database if it's the case.
     */
    if (!user) {
      if (!validateStacksAddress(userAddress)) {
        throw new BadRequestException('Invalid address');
      }
      const token = await getToken({
        req: request,
        secret: this.configService.get('NEXTAUTH_SECRET'),
      });
      if (token && token.sub) {
        const newUser = await this.createUser({
          stacksAddress: userAddress,
          isLegacy: true,
          userSelectFields: { id: true, stacksAddress: true },
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
          newsletter:
            user.newsletter?.status === 'ACTIVE'
              ? { id: user.newsletter.id }
              : null,
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

  async addFollow({
    followerAddress,
    followingAddress,
    createdAt,
  }: {
    followerAddress: string;
    followingAddress: string;
    createdAt: number;
  }) {
    if (!validateStacksAddress(followingAddress)) {
      throw new BadRequestException('Invalid Stacks address.');
    }

    if (followerAddress === followingAddress) {
      throw new BadRequestException('Invalid following address.');
    }

    await this.prisma.follows.create({
      data: {
        followerAddress,
        followingAddress,
        createdAt: new Date(createdAt),
      },
    });

    this.posthog.capture({
      distinctId: followerAddress,
      event: 'follow created',
      properties: {
        followingAddress,
      },
    });
  }

  async removeFollow({
    followerAddress,
    followingAddress,
  }: {
    followerAddress: string;
    followingAddress: string;
  }) {
    if (!validateStacksAddress(followingAddress)) {
      throw new BadRequestException('Invalid Stacks address.');
    }

    await this.prisma.follows.deleteMany({
      where: {
        followerAddress,
        followingAddress,
      },
    });

    this.posthog.capture({
      distinctId: followerAddress,
      event: 'follow deleted',
      properties: {
        followingAddress,
      },
    });
  }
}
