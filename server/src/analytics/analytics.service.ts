import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { differenceInMonths, format, isValid, parse } from 'date-fns';
import { PlausibleService } from '../plausible/plausible.service';
import { StacksService } from '../stacks/stacks.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { maxFathomFromDate } from './utils';

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
    if (username === null) {
      throw new BadRequestException(`No username found for ${stacksAddress}.`);
    }

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
      const publicStoriesFile = await this.stacksService.getPublicStories({
        bucketUrl,
      });
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

  async historical({
    stacksAddress,
    dateFrom,
    dateGrouping,
    storyId,
  }: {
    stacksAddress: string;
    dateFrom: string;
    dateGrouping: string;
    storyId?: string;
  }) {
    const dateTo = new Date();

    const parsedDateFrom = parse(dateFrom, 'yyyy-MM-dd', new Date());
    const isValidDate = isValid(parsedDateFrom);
    if (!isValidDate) {
      throw new BadRequestException('Invalid date from.');
    }

    if (dateGrouping !== 'day' && dateGrouping !== 'month') {
      throw new BadRequestException(
        'Invalid date grouping, must be day or month.',
      );
    }

    // Can only request up to 2 month of daily grouping
    if (
      differenceInMonths(dateTo, parsedDateFrom) > 2 &&
      dateGrouping === 'day'
    ) {
      throw new BadRequestException(
        'dateFrom must be within 2 months when grouping by days,',
      );
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
    if (username === null) {
      throw new BadRequestException(`No username found for ${stacksAddress}.`);
    }

    // Caching mechanism to avoid hitting Plausible too often
    const cacheKey = storyId
      ? `historical:${username}_${dateFrom}_${dateGrouping}_${storyId}`
      : `historical:${username}_${dateFrom}_${dateGrouping}`;
    const cachedResponse = await this.cacheManager.get<string>(cacheKey);
    if (cachedResponse) {
      return JSON.parse(cachedResponse);
    }

    const historicalResponse: {
      historical: {
        date: string;
        visits: number;
        pageviews: number;
      }[];
      stories: {
        pathname: string;
        visits: number;
        pageviews: number;
      }[];
    } = {
      historical: [],
      stories: [],
    };

    const { profile, bucketUrl } = await this.stacksService.getBucketUrl({
      username,
    });
    if (!profile || !bucketUrl) {
      throw new Error(`No profile or bucketUrl for ${username}`);
    }

    let storiesPath: string[];
    if (storyId) {
      storiesPath = [`/${username}/${storyId}`];
    } else {
      const publicStoriesFile = await this.stacksService.getPublicStories({
        bucketUrl,
      });
      storiesPath = publicStoriesFile.map(
        (publicStory) => `/${username}/${publicStory.id}`,
      );
      // Add the root path to the list of paths
      storiesPath.push(`/${username}`);
    }

    const plausibleResults = await this.plausibleService.timeseries({
      dateFrom,
      // TODO enable this part again once we start having more data in
      // For now we always default to day grouping for a few months
      // dateGrouping,
      dateGrouping: 'day',
      dateTo: format(dateTo, 'yyyy-MM-dd'),
      paths: storiesPath,
    });

    historicalResponse.historical = plausibleResults.map((result) => ({
      date: result.date,
      pageviews: result.pageviews,
      visits: result.visitors,
    }));

    /**
     * Stories aggregated results.
     * To limit the calls made to Fathom we reuse the data returned in this API endpoint but ideally
     * once Fathom API is more flexible, this should be moved to it's own endpoint.
     */

    const plausiblePages = await this.plausibleService.pages({
      dateFrom,
      dateTo: format(dateTo, 'yyyy-MM-dd'),
      paths: storiesPath,
    });

    historicalResponse.stories = plausiblePages.map((result) => ({
      pathname:
        result.page === `/${username}`
          ? '/'
          : result.page.replace(`/${username}/`, ''),
      pageviews: result.pageviews,
      visits: result.visitors,
    }));

    // Cache response for 1 hour
    await this.cacheManager.set(
      cacheKey,
      JSON.stringify(historicalResponse),
      60 * 60,
    );

    return historicalResponse;
  }
}
