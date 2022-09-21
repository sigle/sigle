import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

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
}
