import { fetch } from 'undici';
import { lookupProfile } from '@stacks/auth';
import * as fs from 'fs';

const appUrl = 'https://app.sigle.io';

/**
 * 1. List all the subdomains registered on Stacks
 * 2. Check if they are using Sigle in their profile
 * 3. If they allow it, add them to the list of users
 */
const start = async () => {
  let subdomainsNotFound = 0;
  let publicStoriesNotFound = 0;

  // 1. List all the subdomains registered on Stacks
  // TODO https://github.com/hirosystems/stacks-blockchain-api/issues/1097
  const subdomains = [
    'sigleapp.id.blockstack',
    'doesnotexist404.id.blockstack',
    'leopradel.id.blockstack',
  ];
  let urlsToIndex: string[] = [];

  for (const subdomain of subdomains) {
    // 2. Check if they are using Sigle in their profile
    try {
      let userProfile;
      try {
        userProfile = await lookupProfile({ username: subdomain });
      } catch (error) {
        // This will happen if there is no blockstack user with this name
        if (error.message === 'Name not found') {
          subdomainsNotFound += 1;
          continue;
        }
        throw error;
      }
      if (!userProfile.appsMeta[appUrl]) {
        continue;
      }

      const storage = userProfile.appsMeta[appUrl].storage;

      // TODO move this somewhere else?
      const res = await fetch(`${storage}publicStories.json`);
      let file: any;
      if (res.status === 200) {
        file = await res.json();
      } else if (res.status === 404) {
        publicStoriesNotFound += 1;
        continue;
      } else {
        throw new Error(
          `Unexpected status code: ${res.status} for domain ${subdomain}`
        );
      }

      // TODO allow users to disable indexing
      const storyUrls: string[] = file.stories.map(
        (story: { id: string }) => `${appUrl}/${subdomain}/${story.id}`
      );
      storyUrls.unshift(`${appUrl}/${subdomain}`);
      urlsToIndex = urlsToIndex.concat(storyUrls);
    } catch (error) {
      console.error(`Error checking ${subdomain}: ${error}`);
      process.exit(1);
    }
  }

  fs.writeFileSync(`${__dirname}/../urls.json`, JSON.stringify(urlsToIndex), {
    encoding: 'utf8',
  });

  console.log('Urls generated', { subdomainsNotFound, publicStoriesNotFound });
};

start();
