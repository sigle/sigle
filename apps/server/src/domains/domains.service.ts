import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PosthogService } from '../posthog/posthog.service';

@Injectable()
export class DomainsService {
  constructor(
    private readonly prisma: PrismaService,
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

    // TODO fetch current domain from db
    const currentDomain = null;
    if (currentDomain === domain) {
      throw new BadRequestException('Domain already set.');
    }
    // TODO check that the domain is not already used by another user
    // If user already has a domain, remove it from vercel
    if (currentDomain && currentDomain !== domain) {
      // TODO
      // response = await removeDomainFromVercelProject(site.customDomain);
    }

    // TODO add the domain to vercel
    // await addDomainToVercel(value)

    // TODO update domain in db

    this.posthog.capture({
      distinctId: stacksAddress,
      event: 'domain updated',
      properties: {
        domain,
      },
    });
  }
}
