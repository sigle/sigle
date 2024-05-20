import { SettingsFile, Story, SubsetStory } from '../external/gaia';
import { StacksService } from '../stacks/stacks.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class GaiaService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly stacksService: StacksService,
  ) {}

  async getUserStories({
    username,
  }: {
    username: string;
  }): Promise<SubsetStory[]> {
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
    if (!profile) {
      return undefined;
    }

    // Cache response for 1 hour
    await this.cacheManager.set(cacheKey, bucketUrl, 60 * 60);

    return bucketUrl;
  }
}
