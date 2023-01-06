import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';

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
  private readonly posthog: PostHog;

  constructor(private readonly configService: ConfigService) {
    this.posthog = new PostHog(this.configService.get('POSTHOG_API_KEY'));
  }

  capture(args: EventMessageV1) {
    return this.posthog.capture(args);
  }

  onModuleDestroy() {
    this.posthog.shutdown();
  }
}
