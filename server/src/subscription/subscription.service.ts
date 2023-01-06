import { BadRequestException, Injectable } from '@nestjs/common';
import { cvToJSON, uintCV } from 'micro-stacks/clarity';
import { callReadOnlyFunction } from 'micro-stacks/transactions';
import { PosthogService } from '../posthog/posthog.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
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
        nftId: true,
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
    nftId: number;
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

    // If NFT is already linked to another user, we downgrade the subscription of the other user
    // so the NFT id can be used again
    const existingSubscriptionForNFT = await this.prisma.subscription.findFirst(
      {
        select: { id: true, user: { select: { stacksAddress: true } } },
        where: { status: 'ACTIVE', nftId },
      },
    );
    if (existingSubscriptionForNFT) {
      await this.prisma.subscription.update({
        where: { id: existingSubscriptionForNFT.id },
        data: {
          status: 'INACTIVE',
          downgradedAt: new Date(),
        },
      });

      this.posthog.capture({
        distinctId: existingSubscriptionForNFT.user.stacksAddress,
        event: 'subscription downgraded',
        properties: {
          subscriptionId: existingSubscriptionForNFT.id,
          nftId,
        },
      });
    }

    let activeSubscription = await this.prisma.subscription.findFirst({
      select: {
        id: true,
        nftId: true,
      },
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    });
    // When an active subscription is found, we just update the NFT linked to it.
    if (activeSubscription) {
      const prevNftId = activeSubscription.nftId;
      activeSubscription = await this.prisma.subscription.update({
        select: {
          id: true,
          nftId: true,
        },
        where: {
          id: activeSubscription.id,
        },
        data: {
          nftId,
        },
      });

      this.posthog.capture({
        distinctId: stacksAddress,
        event: 'subscription updated',
        properties: {
          subscriptionId: activeSubscription.id,
          prevNftId,
          nftId,
        },
      });
    } else {
      activeSubscription = await this.prisma.subscription.create({
        select: {
          id: true,
          nftId: true,
        },
        data: {
          userId: user.id,
          status: 'ACTIVE',
          nftId,
        },
      });

      this.posthog.capture({
        distinctId: stacksAddress,
        event: 'subscription created',
        properties: {
          subscriptionId: activeSubscription.id,
          nftId,
        },
      });
    }
    return activeSubscription;
  }
}
