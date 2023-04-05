import { BadRequestException, Injectable } from '@nestjs/common';
import { cvToJSON, uintCV } from 'micro-stacks/clarity';
import { callReadOnlyFunction } from 'micro-stacks/transactions';
import { PosthogService } from '../posthog/posthog.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly posthog: PosthogService,
  ) {}

  async getUserActiveSubscription({
    stacksAddress,
  }: {
    stacksAddress: string;
  }) {
    const activeSubscription = await this.prisma.subscription.findFirst({
      where: {
        user: { stacksAddress },
        status: 'ACTIVE',
      },
      select: {
        id: true,
      },
    });
    return activeSubscription;
  }

  async createSubscriptionCreatorPlus({
    stacksAddress,
    nftId,
  }: {
    stacksAddress: string;
    nftId: number;
  }): Promise<{
    id: string;
  }> {
    const result = await callReadOnlyFunction({
      contractAddress: 'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173',
      contractName: 'the-explorer-guild',
      functionName: 'get-owner',
      functionArgs: [uintCV(nftId)],
      senderAddress: 'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173',
    });
    const resultJSON = cvToJSON(result);
    const nftOwnerAddress = resultJSON.value.value.value;

    // User must be the owner of the NFT
    if (nftOwnerAddress !== stacksAddress) {
      throw new BadRequestException(`NFT #${nftId} is not owned by user.`);
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { stacksAddress },
    });

    let activeSubscription = await this.prisma.subscription.findFirst({
      select: {
        id: true,
      },
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    });
    // When an active subscription is found, we just update the NFT linked to it.
    if (activeSubscription) {
      activeSubscription = await this.prisma.subscription.update({
        select: {
          id: true,
        },
        where: {
          id: activeSubscription.id,
        },
        data: {
          // TODO
        },
      });

      this.posthog.capture({
        distinctId: stacksAddress,
        event: 'subscription updated',
        properties: {
          subscriptionId: activeSubscription.id,
          // TODO number nfts
        },
      });
    } else {
      activeSubscription = await this.prisma.subscription.create({
        select: {
          id: true,
        },
        data: {
          userId: user.id,
          status: 'ACTIVE',
        },
      });

      this.posthog.capture({
        distinctId: stacksAddress,
        event: 'subscription created',
        properties: {
          subscriptionId: activeSubscription.id,
          // TODO number nfts
        },
      });
    }
    return activeSubscription;
  }
}
