import { fetch } from 'undici';
import * as fs from 'fs';

const appUrl = 'https://app.sigle.io';

const subdomains: {
  subdomain: string;
  storage: string;
}[] = require('../subdomains.json');

/**
 * List the users stories and generate an url list
 */
const start = async () => {
  let publicStoriesNotFound = 0;
  let urlsToIndex: string[] = [];

  for (const subdomain of subdomains) {
    try {
      const res = await fetch(`${subdomain.storage}publicStories.json`);
      let file: any;
      if (res.status === 200) {
        file = await res.json();
      } else if (res.status === 404) {
        publicStoriesNotFound += 1;
        continue;
      } else {
        throw new Error(
          `Unexpected status code: ${res.status} for domain ${subdomain.subdomain}`,
        );
      }

      const storyUrls: string[] = file.stories.map(
        (story: { id: string }) =>
          `${appUrl}/${subdomain.subdomain}/${story.id}`,
      );
      storyUrls.unshift(`${appUrl}/${subdomain.subdomain}`);
      urlsToIndex = urlsToIndex.concat(storyUrls);
    } catch (error) {
      console.error(`Error checking ${subdomain.subdomain}: ${error}`);
      process.exit(1);
    }
  }

  fs.writeFileSync(`${__dirname}/../urls.json`, JSON.stringify(urlsToIndex), {
    encoding: 'utf8',
  });

  console.log('Urls generated', { publicStoriesNotFound });
};

start();
