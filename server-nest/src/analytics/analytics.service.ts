import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { format, isValid, parse } from 'date-fns';
import { PlausibleService } from 'src/plausible/plausible.service';
import { StacksService } from '../stacks/stacks.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { getPublicStories, maxFathomFromDate } from './utils';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly subscriptionService: SubscriptionService,
    private readonly stacksService: StacksService,
    private readonly plausibleService: PlausibleService,
  ) {}

  async referrers({
    stacksAddress,
    dateFrom,
    storyId,
  }: {
    stacksAddress: string;
    dateFrom: string;
    storyId?: string;
  }) {
    const dateTo = new Date();

    const parsedDateFrom = parse(dateFrom, 'yyyy-MM-dd', new Date());
    const isValidDate = isValid(parsedDateFrom);
    if (!isValidDate) {
      throw new BadRequestException('Invalid date from.');
    }

    // Set max date in the past
    dateFrom = maxFathomFromDate(parsedDateFrom, dateFrom);

    const activeSubscription =
      await this.subscriptionService.getUserActiveSubscription({
        stacksAddress,
      });
    if (!activeSubscription) {
      throw new BadRequestException('No active subscription.');
    }

    const username = await this.stacksService.getUsernameByAddress(
      stacksAddress,
    );

    // Caching mechanism to avoid hitting Plausible too often
    const cacheKey = storyId
      ? `referrers:${username}_${dateFrom}_${storyId}`
      : `referrers:${username}_${dateFrom}`;
    const cachedResponse = await this.cacheManager.get<string>(cacheKey);
    if (cachedResponse) {
      return JSON.parse(cachedResponse);
    }

    const { profile, bucketUrl } = await this.stacksService.getBucketUrl({
      username,
    });
    if (!profile || !bucketUrl) {
      throw new BadRequestException(`No profile or bucketUrl for ${username}.`);
    }

    let storiesPath: string[];
    if (storyId) {
      storiesPath = [`/${username}/${storyId}`];
    } else {
      const publicStoriesFile = await getPublicStories({ bucketUrl });
      storiesPath = publicStoriesFile.map(
        (publicStory) => `/${username}/${publicStory.id}`,
      );
      // Add the root path to the list of paths
      storiesPath.push(`/${username}`);
    }

    const plausibleReferrers = await this.plausibleService.referrers({
      dateFrom,
      dateTo: format(dateTo, 'yyyy-MM-dd'),
      paths: storiesPath,
    });

    const referrersResponse: {
      domain: string | null;
      count: number;
    }[] = plausibleReferrers
      .map((result) => ({
        domain: result.source,
        count: result.pageviews,
      }))
      .sort((a, b) => b.count - a.count);

    // Cache response for 1 hour
    await this.cacheManager.set(
      cacheKey,
      JSON.stringify(referrersResponse),
      60 * 60,
    );

    return referrersResponse;
  }
}
