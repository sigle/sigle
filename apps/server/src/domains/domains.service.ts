import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PosthogService } from '../posthog/posthog.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class DomainsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
    private readonly posthog: PosthogService,
  ) {}

  async updateDomain({
    stacksAddress,
    domain,
  }: {
    stacksAddress: string;
    domain: string;
  }) {
    // TODO validate domain with regex
    // if (!validateStacksAddress(followingAddress)) {
    //   throw new BadRequestException('Invalid Stacks address.');
    // }

    const activeSubscription =
      await this.subscriptionService.getUserActiveSubscription({
        stacksAddress,
      });
    if (!activeSubscription) {
      throw new BadRequestException('No active subscription.');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      select: {
        id: true,
        site: {
          select: {
            id: true,
            domain: true,
          },
        },
      },
      where: {
        stacksAddress,
      },
    });
    const currentDomain = user.site?.domain;
    if (currentDomain === domain) {
      return true;
    }

    // Check that the domain is not already used by another user
    const existingDomain = await this.prisma.site.findUnique({
      select: {
        id: true,
      },
      where: {
        domain,
      },
    });
    if (existingDomain) {
      throw new BadRequestException('Domain already in use.');
    }

    // If user already has a domain, remove it from vercel
    if (currentDomain && currentDomain !== domain) {
      // TODO
      // response = await removeDomainFromVercelProject(site.customDomain);
    }

    // TODO add the domain to vercel
    // await addDomainToVercel(value)

    await this.prisma.site.upsert({
      // Workaround for select to work when creating the story
      where: { id: user.site ? user.site.id : 'none' },
      create: {
        domain,
        userId: user.id,
      },
      update: {
        domain,
      },
    });

    this.posthog.capture({
      distinctId: stacksAddress,
      event: 'domain updated',
      properties: {
        domain,
      },
    });

    return true;
  }
}
