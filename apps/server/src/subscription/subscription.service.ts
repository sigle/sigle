import { Injectable } from '@nestjs/common';
import { NonFungibleTokensApi } from '@stacks/blockchain-api-client';
import { PosthogService } from '../posthog/posthog.service';
import { PrismaService } from '../prisma/prisma.service';

const NUMBER_NFTS_PUBLISHER = 3;

@Injectable()
export class SubscriptionService {
  private readonly nftApi = new NonFungibleTokensApi();

  constructor(
    private readonly prisma: PrismaService,
    private readonly posthog: PosthogService,
  ) {
    this.nftApi = new NonFungibleTokensApi();
  }

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
        plan: true,
      },
    });
    return activeSubscription;
  }

  async syncSubscriptionWithNft({
    stacksAddress,
  }: {
    stacksAddress: string;
  }): Promise<{
    id: string;
    plan: 'BASIC' | 'PUBLISHER' | 'ENTERPRISE';
  } | null> {
    const nftHoldings = await this.nftApi.getNftHoldings({
      principal: stacksAddress,
      assetIdentifiers: [
        'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild::The-Explorer-Guild',
      ],
    });
    const numberNfts = nftHoldings.total;

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { stacksAddress },
    });

    let activeSubscription = await this.prisma.subscription.findFirst({
      select: {
        id: true,
        plan: true,
      },
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (numberNfts === 0) {
      // If the user has no NFT, we downgrade the subscription if it exists.
      if (activeSubscription) {
        activeSubscription = await this.prisma.subscription.update({
          select: {
            id: true,
            plan: true,
          },
          where: {
            id: activeSubscription.id,
          },
          data: {
            status: 'INACTIVE',
            downgradedAt: new Date(),
          },
        });

        this.posthog.capture({
          distinctId: stacksAddress,
          event: 'subscription downgraded',
          properties: {
            subscriptionId: activeSubscription.id,
            numberNfts,
          },
        });
      }

      return activeSubscription;
    }

    if (!activeSubscription) {
      activeSubscription = await this.prisma.subscription.create({
        select: {
          id: true,
          plan: true,
        },
        data: {
          userId: user.id,
          status: 'ACTIVE',
          plan: numberNfts >= NUMBER_NFTS_PUBLISHER ? 'PUBLISHER' : 'BASIC',
        },
      });

      this.posthog.capture({
        distinctId: stacksAddress,
        event: 'subscription created',
        properties: {
          subscriptionId: activeSubscription.id,
          numberNfts,
          plan: numberNfts >= NUMBER_NFTS_PUBLISHER ? 'PUBLISHER' : 'BASIC',
        },
      });
    } else {
      // If active subscription is found, we check if we should upgrade it.
      if (activeSubscription.plan === 'BASIC' && numberNfts >= 3) {
        activeSubscription = await this.prisma.subscription.update({
          select: {
            id: true,
            plan: true,
          },
          where: {
            id: activeSubscription.id,
          },
          data: {
            plan: 'PUBLISHER',
            upgradedAt: new Date(),
          },
        });

        this.posthog.capture({
          distinctId: stacksAddress,
          event: 'subscription upgraded',
          properties: {
            subscriptionId: activeSubscription.id,
            numberNfts,
            plan: 'PUBLISHER',
          },
        });
      }

      // If active subscription is found, we check if we should downgrade it.
      if (activeSubscription.plan === 'PUBLISHER' && numberNfts < 3) {
        activeSubscription = await this.prisma.subscription.update({
          select: {
            id: true,
            plan: true,
          },
          where: {
            id: activeSubscription.id,
          },
          data: {
            plan: 'BASIC',
            downgradedAt: new Date(),
          },
        });

        this.posthog.capture({
          distinctId: stacksAddress,
          event: 'subscription downgraded',
          properties: {
            subscriptionId: activeSubscription.id,
            numberNfts,
            plan: 'BASIC',
          },
        });
      }
    }

    return activeSubscription;
  }
}
