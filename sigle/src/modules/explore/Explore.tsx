import { useQuery } from 'react-query';
import { NamesApi } from '@stacks/blockchain-api-client';
import { useGetUserFollowing } from '../../hooks/appData';
import { Box, LoadingSpinner, Typography } from '../../ui';
import { DashboardLayout } from '../layout';
import { lookupProfile } from '@stacks/auth';
import { sigleConfig } from '../../config';
import { fetchPublicStories, fetchSettings } from '../../pages/[username].page';
import { SettingsFile, SubsetStory } from '../../types';
import { StoryCard } from '../storyCard/StoryCard';
import { UserCard } from '../userCard/UserCard';

export const ExploreUsers = () => {
  const { isLoading: isLoadingUserFollowing, data: userFollowing } =
    useGetUserFollowing();

  // TODO get data from the API

  return (
    <DashboardLayout>
      <Typography size="h4" css={{ fontWeight: 600 }}>
        Explore
      </Typography>

      {isLoadingUserFollowing ? (
        <Box css={{ mt: '$10' }}>
          <LoadingSpinner />
        </Box>
      ) : null}

      {userFollowing &&
        Object.keys(userFollowing.following).map((user, index) => (
          <UserCard key={index} userInfo={{ username: '', address: user }} />
        ))}
    </DashboardLayout>
  );
};
