import { lookupProfile } from '@stacks/auth';
import { differenceInDays } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';

const appUrl = 'https://app.sigle.io';
const generatedFolderPath = path.join(__dirname, '..', '__generated__');
const subdomainsFilePath = path.join(generatedFolderPath, 'subdomains.json');

interface Subdomain {
  subdomain: string;
  storage: string;
  lastFetch: number;
}

/**
 * 1. List all the subdomains registered on Stacks
 * 2. Check if they are using Sigle in their profile
 * 3. If they allow it, add them to the list of users
 */
const start = async () => {
  // Init required folders
  if (!fs.existsSync(generatedFolderPath)) {
    fs.mkdirSync(generatedFolderPath);
  }

  let subdomainsFile: Subdomain[] = [];
  try {
    subdomainsFile = JSON.parse(
      fs.readFileSync(subdomainsFilePath, {
        encoding: 'utf8',
      })
    );
  } catch (error) {
    if (error.code === 'ENOENT') {
      subdomainsFile = [];
    } else {
      throw error;
    }
  }

  let subdomainsProcessed = 0;
  let subdomainsNotFound = 0;
  let subdomainsSkipped = 0;

  // 1. List all the subdomains registered on Stacks
  // TODO https://github.com/hirosystems/stacks-blockchain-api/issues/1097
  const subdomains = [
    'sigleapp.id.blockstack',
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
  let subdomainsFound: Subdomain[] = [];

  for (const subdomain of subdomains) {
    // Only refetch the profile if checked more than an week ago
    const subdomainProfile = subdomainsFile.find(
      (data) => data.subdomain === subdomain
    );
    if (
      subdomainProfile &&
      differenceInDays(new Date(), new Date(subdomainProfile.lastFetch)) < 7
    ) {
      subdomainsFound.push(subdomainProfile);
      subdomainsSkipped += 1;
      continue;
    }

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

      subdomainsFound.push({
        subdomain,
        storage,
        lastFetch: new Date().getTime(),
      });
      subdomainsProcessed += 1;
    } catch (error) {
      console.error(`Error checking ${subdomain}: ${error}`);
      process.exit(1);
    }
  }

  fs.writeFileSync(subdomainsFilePath, JSON.stringify(subdomainsFound), {
    encoding: 'utf8',
  });

  console.log('Subdomains generated', {
    subdomainsProcessed,
    subdomainsSkipped,
    subdomainsNotFound,
  });
};

start();
