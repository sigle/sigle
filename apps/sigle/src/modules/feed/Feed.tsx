import { useQuery } from '@tanstack/react-query';
import { NamesApi } from '@stacks/blockchain-api-client';
import { lookupProfile } from '@stacks/auth';
import Link from 'next/link';
import { useGetGaiaUserFollowing } from '../../hooks/appData';
import { Box, Button, Flex, LoadingSpinner, Typography } from '../../ui';
import { DashboardLayout } from '../layout';
import { sigleConfig } from '../../config';
import { SettingsFile, SubsetStory } from '../../types';
import { StoryCard } from '../storyCard/StoryCard';
import { fetchPublicStories, fetchSettings } from '../../utils/gaia/fetch';

interface StoriesWithUser extends SubsetStory {
  user: {
    address: string;
    username: string;
    settings: SettingsFile;
  };
}

export const UserFeed = () => {
  const { isLoading: isLoadingUserFollowing, data: userFollowing } =
    useGetGaiaUserFollowing();
  const { isLoading: isLoadingFeed, data: feedStories } = useQuery(
    ['feed-activity', userFollowing],
    async () => {
      const feedStories: StoriesWithUser[] = [];
      const stacksNamesApi = new NamesApi();
      const addresses = userFollowing
        ? Object.keys(userFollowing.following)
        : [];

      for (const address of addresses) {
        // First we get the name associated to this address
        const names = await stacksNamesApi.getNamesOwnedByAddress({
          address,
          blockchain: 'stacks',
        });
        const username = names.names[0];
        if (!username) {
          continue;
        }

        // Then we get the user profile and bucket url
        let userProfile;
        try {
          userProfile = await lookupProfile({ username });
        } catch (error) {
          // This will happen if there is no blockstack user with this name
          if (error.message === 'Name not found') {
            continue;
          } else {
            console.error(error);
            continue;
          }
        }
        const bucketUrl =
          userProfile &&
          userProfile.apps &&
          userProfile.apps[sigleConfig.appUrl];
        if (!bucketUrl) {
          continue;
        }

        // Then we get the stories and settings
        const [dataPublicStories, dataSettings] = await Promise.all([
          fetchPublicStories(bucketUrl),
          fetchSettings(bucketUrl),
        ]);

        dataPublicStories.file.stories.forEach((story: SubsetStory) => {
          feedStories.push({
            ...story,
            user: {
              address,
              username,
              settings: dataSettings.file,
            },
          });
        });
      }

      // After all the users are processed, we sort the stories by date
      feedStories.sort((a, b) => {
        return b.createdAt - a.createdAt;
      });

      return feedStories;
    },
    { enabled: !!userFollowing },
  );

  return (
    <DashboardLayout>
      <Typography
        size="h4"
        css={{
          fontWeight: 600,
          pb: '$5',
          borderBottom: '1px solid $colors$gray6',
        }}
      >
        Feed
      </Typography>

      {isLoadingUserFollowing || isLoadingFeed ? (
        <Box css={{ mt: '$10' }}>
          <LoadingSpinner />
        </Box>
      ) : null}

      {feedStories &&
        feedStories.map((story, index) => (
          <StoryCard
            key={index}
            displayUser={true}
            userInfo={story.user}
            settings={story.user.settings}
            story={story}
          />
        ))}
      {feedStories && feedStories.length <= 0 && (
        <Flex align="center" direction="column" gap="3">
          <Typography css={{ mt: '$10' }} size="subheading">
            You must follow writers to start filling your feed
          </Typography>
          <Link href="/explore" passHref legacyBehavior>
            <Button color="orange" as="a">
              Explore new writers
            </Button>
          </Link>
        </Flex>
      )}
    </DashboardLayout>
  );
};
