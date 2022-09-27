import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { fetch } from 'undici';

@Injectable()
export class StacksService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
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
}
