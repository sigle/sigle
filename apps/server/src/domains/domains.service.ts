import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PosthogService } from '../posthog/posthog.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { EnvironmentVariables } from '../environment/environment.validation';
import { validDomainRegex } from '../utils';

// From https://vercel.com/docs/rest-api/endpoints#get-a-domain-s-configuration
interface DomainConfigResponse {
  /** How we see the domain's configuration. - `CNAME`: Domain has a CNAME pointing to Vercel. - `A`: Domain's A record is resolving to Vercel. - `http`: Domain is resolving to Vercel but may be behind a Proxy. - `null`: Domain is not resolving to Vercel. */
  configuredBy?: ('CNAME' | 'A' | 'http') | null;
  /** Which challenge types the domain can use for issuing certs. */
  acceptedChallenges?: ('dns-01' | 'http-01')[];
  /** Whether or not the domain is configured AND we can automatically generate a TLS certificate. */
  misconfigured: boolean;
}

@Injectable()
export class DomainsService {
  private readonly vercelTeamId: string;
  private readonly vercelProjectId: string;
  private readonly vercelBearerToken: string;

  constructor(
    @InjectSentry() private readonly sentryService: SentryService,
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
    private readonly posthog: PosthogService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    this.vercelTeamId = this.configService.get('VERCEL_TEAM_ID');
    this.vercelProjectId = this.configService.get('VERCEL_PROJECT_ID');
    this.vercelBearerToken = this.configService.get('VERCEL_BEARER_TOKEN');
  }

  async get({ stacksAddress }: { stacksAddress: string }) {
    const user = await this.prisma.user.findUniqueOrThrow({
      select: {
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
    return user.site;
  }

  async updateDomain({
    stacksAddress,
    domain,
  }: {
    stacksAddress: string;
    domain: string;
  }) {
    this.checkVercelSetup();

    if (!validDomainRegex.test(domain)) {
      throw new BadRequestException('Invalid domain.');
    }

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
      const response = await this.removeDomainFromVercelProject(currentDomain);
      if ('error' in response) {
        this.sentryService
          .instance()
          .captureMessage('Failed to remove vercel domain', {
            level: 'error',
            extra: {
              response,
            },
          });
        throw new InternalServerErrorException();
      }
    }

    const response = await this.addDomainToVercel(domain);
    if ('error' in response) {
      this.sentryService
        .instance()
        .captureMessage('Failed to add vercel domain', {
          level: 'error',
          extra: {
            response,
          },
        });
      throw new InternalServerErrorException();
    }
    if (!response.verified) {
      this.sentryService
        .instance()
        .captureMessage('Failed to add vercel domain', {
          level: 'error',
          extra: {
            response,
          },
        });
      throw new InternalServerErrorException();
    }

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
        created: !currentDomain,
      },
    });

    return true;
  }

  async verify({ stacksAddress }: { stacksAddress: string }) {
    this.checkVercelSetup();

    const user = await this.prisma.user.findUniqueOrThrow({
      select: {
        site: {
          select: {
            domain: true,
          },
        },
      },
      where: {
        stacksAddress,
      },
    });
    if (!user.site?.domain) {
      throw new BadRequestException('No domain set.');
    }

    let status: 'misconfigured' | 'verified';
    const response = await this.getConfigResponse(user.site.domain);
    if (response.misconfigured) {
      status = 'misconfigured';
    } else {
      status = 'verified';
    }

    return {
      status,
    };
  }

  private checkVercelSetup() {
    if (
      !this.vercelTeamId ||
      !this.vercelProjectId ||
      !this.vercelBearerToken
    ) {
      throw new BadRequestException('Vercel not setup.');
    }
  }

  private async addDomainToVercel(domain: string): Promise<
    | {
        error: {
          code: string;
        };
      }
    | {
        name: string;
        verified?: boolean;
      }
  > {
    return await fetch(
      `https://api.vercel.com/v10/projects/${this.vercelProjectId}/domains?teamId=${this.vercelTeamId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.vercelBearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: domain,
        }),
      },
    ).then((res) => res.json());
  }

  private async removeDomainFromVercelProject(domain: string): Promise<{
    error: {
      code: string;
    };
  }> {
    return await fetch(
      `https://api.vercel.com/v9/projects/${this.vercelProjectId}/domains/${domain}?teamId=${this.vercelTeamId}`,
      {
        headers: {
          Authorization: `Bearer ${this.vercelBearerToken}`,
        },
        method: 'DELETE',
      },
    ).then((res) => res.json());
  }

  private async getConfigResponse(
    domain: string,
  ): Promise<DomainConfigResponse> {
    return await fetch(
      `https://api.vercel.com/v6/domains/${domain}/config?teamId=${this.vercelTeamId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.vercelBearerToken}`,
          'Content-Type': 'application/json',
        },
      },
    ).then((res) => res.json());
  }
}
