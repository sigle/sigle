import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';
import { EnvironmentVariables } from '../environment/environment.validation';

interface IdentifyMessageV1 {
  distinctId: string;
  properties?: Record<string | number, any>;
}
interface EventMessageV1 extends IdentifyMessageV1 {
  event: string;
  groups?: Record<string, string | number>;
  sendFeatureFlags?: boolean;
}

@Injectable()
export class PosthogService implements OnModuleDestroy {
  private readonly logger = new Logger(PosthogService.name);
  private readonly posthog: PostHog;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    const postHogApiKey = this.configService.get('POSTHOG_API_KEY');
    const nodeEnv = this.configService.get('NODE_ENV');
    if (nodeEnv !== 'test' && postHogApiKey) {
      this.posthog = new PostHog(postHogApiKey);
    }
  }

  capture(args: EventMessageV1): void {
    this.logger.debug('PostHog capture event', args);
    return this.posthog?.capture(args);
  }

  onModuleDestroy(): void {
    this.logger.debug('PostHog shutdown');
    this.posthog?.shutdown();
  }
}
