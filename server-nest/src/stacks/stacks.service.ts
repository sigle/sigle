import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { lookupProfile } from 'micro-stacks/storage';
import { migrationStories, SubsetStory } from '../external/gaia';
import { fetch } from 'undici';
import { EnvironmentVariables } from '../environment/environment.validation';

@Injectable()
export class StacksService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}
  /**
   * Return the username of a stacks address.
   * Cache the result for better performance as the username is not changing often.
   */
  async getUsernameByAddress(address: string): Promise<string> {
    const cacheKey = `stacks_username:${address}`;
    const cachedResponse = await this.cacheManager.get<string>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    let username: string;
    const namesResponse = await fetch(
      `https://stacks-node-api.stacks.co/v1/addresses/stacks/${address}`,
    );
    const namesJson = (await namesResponse.json()) as { names: string[] };
    if ((namesJson.names.length || 0) > 0) {
      username = namesJson.names[0];
    } else {
      throw new Error(`No username found for ${address}`);
    }

    // Cache response for 1 day
    await this.cacheManager.set(cacheKey, username, 24 * 60 * 60);
    return username;
  }

  async getBucketUrl({
    username,
  }: {
    username: string;
  }): Promise<{ profile: Record<string, any>; bucketUrl: string }> {
    let userProfile: Record<string, any> | undefined;
    try {
      userProfile = await lookupProfile({ username });
    } catch (error) {
      // This will happen if there is no blockstack user with this name
      if (error.message === 'Name not found') {
        userProfile = undefined;
      } else {
        throw error;
      }
    }

    const bucketUrl: string | undefined =
      userProfile &&
      userProfile.apps &&
      userProfile.apps[this.configService.get('APP_URL')];

    return { profile: userProfile, bucketUrl };
  }

  async getPublicStories({
    bucketUrl,
  }: {
    bucketUrl: string;
  }): Promise<SubsetStory[]> {
    const resPublicStories = await fetch(`${bucketUrl}publicStories.json`);
    // This would happen if the user has not published any stories
    if (resPublicStories.status !== 200) {
      return [];
    }
    const publicStoriesFile = migrationStories(
      (await resPublicStories.json()) as any,
    );
    return publicStoriesFile.stories;
  }
}
