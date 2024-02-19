import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lookupProfile } from '@stacks/auth';
import {
  migrationStories,
  SettingsFile,
  Story,
  SubsetStory,
} from '../external/gaia';
import { fetch } from 'undici';
import { EnvironmentVariables } from '../environment/environment.validation';

@Injectable()
export class StacksService {
  private readonly publicStoriesFileName = 'publicStories.json';
  private readonly settingsFileName = 'settings.json';

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  /**
   * Return the username associated to a stacks address.
   * If the user has 1 free subdomain and 1 .btc, the .btc will be returned.
   */
  async getUsernameByAddress(address: string): Promise<string | null> {
    const namesResponse = await fetch(
      `https://api.hiro.so/v1/addresses/stacks/${address}`,
    );
    const namesJson = (await namesResponse.json()) as { names: string[] };
    if (namesJson.names && namesJson.names.length > 0) {
      return (
        namesJson.names.find(
          (name: string) => name.endsWith('.btc') === true,
        ) || namesJson.names[0]
      );
    }
    return null;
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
      if (error?.message === 'Name not found') {
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
    const resPublicStories = await fetch(
      `${bucketUrl}${this.publicStoriesFileName}`,
    );
    // This would happen if the user has not published any stories
    if (resPublicStories.status !== 200) {
      return [];
    }
    const publicStoriesFile = migrationStories(
      (await resPublicStories.json()) as any,
    );
    return publicStoriesFile.stories;
  }

  async getPublicStory({
    bucketUrl,
    storyId,
  }: {
    bucketUrl: string;
    storyId: string;
  }): Promise<Story | null> {
    const resPublicStory = await fetch(`${bucketUrl}${storyId}.json`);
    if (resPublicStory.status !== 200) {
      return null;
    }
    return (await resPublicStory.json()) as Story;
  }

  async getPublicSettings({
    bucketUrl,
  }: {
    bucketUrl: string;
  }): Promise<SettingsFile> {
    const resPublicSettings = await fetch(
      `${bucketUrl}${this.settingsFileName}`,
    );
    // This would happen if the user does not have any settings
    if (resPublicSettings.status !== 200) {
      return {};
    }
    return (await resPublicSettings.json()) as SettingsFile;
  }
}
