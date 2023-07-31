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

  // 1. List all the subdomains registered on Stacks
  // TODO https://github.com/hirosystems/stacks-blockchain-api/issues/1097
  const subdomains = [
    'sigle.btc',
    'friedger.id',
    'project_indigo.id.stx',
    'eliherf01.id.stx',
    'nonnish_kingdom.id.stx',
    'the_ghost_of_kyiv.id.stx',
    'tigerforce.id.stx',
    'stackerdaolabs.id.stx',
    'madstar_nft.id.stx',
    'akirtovskis.id.stx',
    'learnblock.id.blockstack',
    'privacyperspective.id.stx',
    'freeos_dao.id.blockstack',
    'retcheto.id.stx',
  ];
  let subdomainsFound: { subdomain: string; storage: string }[] = [];

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

      subdomainsFound.push({ subdomain, storage });
    } catch (error) {
      console.error(`Error checking ${subdomain}: ${error}`);
      process.exit(1);
    }
  }

  fs.writeFileSync(
    `${__dirname}/../subdomains.json`,
    JSON.stringify(subdomainsFound),
    {
      encoding: 'utf8',
    },
  );

  console.log('Subdomains generated', { subdomainsNotFound });
};

start();
