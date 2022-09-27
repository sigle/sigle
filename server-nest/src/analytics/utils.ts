import { isBefore } from 'date-fns';
import { fetch } from 'undici';
import { migrationStories, SubsetStory } from '../external/gaia';

// All queries should start at this date maximum.
const STATS_MAX_FROM_DATE = '2022-05-01';

/**
 * Set max date in the past. Fathom data is not correct before this one.
 */
export const maxFathomFromDate = (parsedDateFrom: Date, dateFrom: string) => {
  if (isBefore(parsedDateFrom, new Date(STATS_MAX_FROM_DATE))) {
    return STATS_MAX_FROM_DATE;
  }
  return dateFrom;
};

export const getPublicStories = async ({
  bucketUrl,
}: {
  bucketUrl: string;
}): Promise<SubsetStory[]> => {
  const resPublicStories = await fetch(`${bucketUrl}publicStories.json`);
  // This would happen if the user has not published any stories
  if (resPublicStories.status !== 200) {
    return [];
  }
  const publicStoriesFile = migrationStories(
    (await resPublicStories.json()) as any,
  );
  return publicStoriesFile.stories;
};
