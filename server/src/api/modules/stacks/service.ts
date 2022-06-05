import { fetch } from 'undici';
import { config } from '../../../config';
import { redis } from '../../../redis';

export const StacksService = {
  /**
   * Return the username of a stacks address.
   * Cache the result for better performance as the username is not changing often.
   */
  getUsernameByAddress: async (address: string): Promise<string> => {
    const cacheKey = `stacks_username:${address}`;
    const cachedResponse = await redis.get(cacheKey);
    if (cachedResponse && config.NODE_ENV !== 'test') {
      return cachedResponse;
    }

    let username: string;
    const namesResponse = await fetch(
      `https://stacks-node-api.stacks.co/v1/addresses/stacks/${address}`
    );
    const namesJson = (await namesResponse.json()) as { names: string[] };
    if ((namesJson.names.length || 0) > 0) {
      username = namesJson.names[0];
    } else {
      throw new Error(`No username found for ${address}`);
    }

    // Cache response for 1 day
    await redis.set(cacheKey, username, 'EX', 24 * 60 * 60);
    return username;
  },
};
