import { SettingsFile, Story, SubsetStory } from '../external/gaia';
import { StacksService } from '../stacks/stacks.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import {
  BnsGetNameInfoResponse,
  NamesApi,
} from '@stacks/blockchain-api-client';
import { Cache } from 'cache-manager';

@Injectable()
export class GaiaService {
  private stacksNamesApi = new NamesApi();

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectSentry() private readonly sentryService: SentryService,
    private readonly stacksService: StacksService,
  ) {}

  async getUserInfo({
    username,
  }: {
    username: string;
  }): Promise<{ username: string; address: string } | null> {
    if (!this.validateUsername(username)) {
      throw new BadRequestException('Invalid username');
    }

    const cacheKey = `name-info:${username}`;
    const cachedResponse = await this.cacheManager.get<string>(cacheKey);
    if (cachedResponse) {
      return JSON.parse(cachedResponse);
    }

    let nameInfo: BnsGetNameInfoResponse | null = null;
    try {
      nameInfo = await this.stacksNamesApi.getNameInfo({ name: username });
    } catch (error) {
      // This will happen if there is no Stacks user with this name
      if (error.status === 404) {
        nameInfo = null;
      } else {
        this.sentryService.instance().captureException(error, {
          level: 'error',
          extra: {
            username,
          },
        });
        throw new InternalServerErrorException(
          `Failed to fetch name info: ${error.message}`,
        );
      }
    }

    if (!nameInfo) {
      return null;
    }

    // Cache response for 1 minute
    const result = { username, address: nameInfo.address };
    await this.cacheManager.set(cacheKey, JSON.stringify(result), 60);

    return result;
  }

  async getUserStories({
    username,
  }: {
    username: string;
  }): Promise<SubsetStory[]> {
    if (!this.validateUsername(username)) {
      throw new BadRequestException('Invalid username');
    }
    const bucketUrl = await this.getCachedBucketUrl(username);

    if (!bucketUrl) {
      return [];
    }

    const cacheKey = `stories:${username}`;
    const cachedResponse = await this.cacheManager.get<string>(cacheKey);
    if (cachedResponse) {
      return JSON.parse(cachedResponse);
    }

    const publicStoriesFile = await this.stacksService.getPublicStories({
      bucketUrl,
    });

    // Cache response for 1 minute
    await this.cacheManager.set(
      cacheKey,
      JSON.stringify(publicStoriesFile),
      60,
    );

    return publicStoriesFile;
  }

  async getUserStory({
    username,
    storyId,
  }: {
    username: string;
    storyId: string;
  }): Promise<Story | null> {
    if (!this.validateUsername(username)) {
      throw new BadRequestException('Invalid username');
    }
    const bucketUrl = await this.getCachedBucketUrl(username);

    if (!bucketUrl) {
      return null;
    }

    const cacheKey = `story:${username}:${storyId}`;
    const cachedResponse = await this.cacheManager.get<string>(cacheKey);
    if (cachedResponse) {
      return JSON.parse(cachedResponse);
    }

    const storyFile = await this.stacksService.getPublicStory({
      bucketUrl,
      storyId,
    });

    // Cache response for 1 minute
    await this.cacheManager.set(cacheKey, JSON.stringify(storyFile), 60);

    return storyFile;
  }

  async getUserSettings({
    username,
  }: {
    username: string;
  }): Promise<SettingsFile | null> {
    if (!this.validateUsername(username)) {
      throw new BadRequestException('Invalid username');
    }
    const bucketUrl = await this.getCachedBucketUrl(username);

    if (!bucketUrl) {
      return null;
    }

    const cacheKey = `settings:${username}`;
    const cachedResponse = await this.cacheManager.get<string>(cacheKey);
    if (cachedResponse) {
      return JSON.parse(cachedResponse);
    }

    const settingsFile = await this.stacksService.getPublicSettings({
      bucketUrl,
    });

    // Cache response for 1 minute
    await this.cacheManager.set(cacheKey, JSON.stringify(settingsFile), 60);

    return settingsFile;
  }

  /**
   * Caches the bucket URL for 1 hour.
   * This is to avoid hitting the Gaia hub too often.
   */
  private async getCachedBucketUrl(
    username: string,
  ): Promise<string | undefined> {
    const cacheKey = `bucket-url:${username}`;

    const cachedResponse = await this.cacheManager.get<string>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const { profile, bucketUrl } = await this.stacksService.getBucketUrl({
      username,
    });
    if (!profile || !bucketUrl) {
      return undefined;
    }

    // Cache response for 1 hour
    await this.cacheManager.set(cacheKey, bucketUrl, 60 * 60);

    return bucketUrl;
  }

  private validateUsername(username: string): boolean {
    const validExtensions = ['.id', '.btc', '.id.stx', '.id.blockstack'];
    return validExtensions.some((ext) => username.endsWith(ext));
  }
}
