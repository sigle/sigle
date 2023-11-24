import { lookupProfile } from '@stacks/auth';
import { NamesApi } from '@stacks/blockchain-api-client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { sigleConfig } from '../../config';
import {
  useGetGaiaUserFollowing,
  useUserFollow,
  useUserUnfollow,
} from '../../hooks/appData';
import { styled } from '../../stitches.config';
import { Button, Flex, Typography } from '../../ui';
import { generateAvatar } from '../../utils/boringAvatar';
import { fetchSettings } from '../../utils/gaia/fetch';
import { useAuth } from '../auth/AuthContext';
import { LoginModal } from '../loginModal/LoginModal';

const UserCardContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid $colors$gray6',
  py: '$5',
  gap: '$5',

  '@md': {
    alignItems: 'start',
  },
});

const ProfileImageContainer = styled('a', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  br: '$1',
  overflow: 'hidden',
  width: 50,
  height: 50,
  flex: 'none',

  '@md': {
    width: 38,
    height: 38,
  },
});

const ProfileImage = styled('img', {
  maxWidth: 50,
  maxHeight: 50,

  width: 'auto',
  height: '100%',
  objectFit: 'cover',

  '@md': {
    maxWidth: 38,
    maxHeight: 38,
  },
});

const UserCardTitle = styled(Typography, {
  maxWidth: 160,
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  '@md': {
    maxWidth: 600,
  },
});

const UserCardDescription = styled(Typography, {
  maxWidth: 200,
  mt: '$1',
  pr: '$2',
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  '@md': {
    maxWidth: 600,
    whiteSpace: 'normal',
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    typographyOverflow: 'ellipsis',
  },
});

interface UserCardProps {
  address: string;
}

export const UserCard = ({ address }: UserCardProps) => {
  const { user, isLegacy } = useAuth();
  const [showLoginPromptDialog, setShowLoginPromptDialog] = useState(false);
  const { mutate: followUser } = useUserFollow();
  const { mutate: unfollowUser } = useUserUnfollow();
  const { isLoading: isLoadingUsername, data: username } = useQuery(
    ['get-username-user', address],
    async () => {
      const stacksNamesApi = new NamesApi();
      const names = await stacksNamesApi.getNamesOwnedByAddress({
        address,
        blockchain: 'stacks',
      });
      return names.names[0];
    },
  );
  const { data: userFollowing } = useGetGaiaUserFollowing({
    enabled: !!user && username !== user.username,
    staleTime: Infinity,
  });

  const { data: userSettings } = useQuery(
    ['get-user-settings-with-username', username],
    async () => {
      if (!username) return null;

      // Then we get the user profile and bucket url
      let userProfile;
      try {
        userProfile = await lookupProfile({ username });
      } catch (error) {
        // This will happen if there is no blockstack user with this name
        if (error.message === 'Name not found') {
          return null;
        } else {
          console.error(error);
          return null;
        }
      }
      const bucketUrl =
        userProfile && userProfile.apps && userProfile.apps[sigleConfig.appUrl];
      if (!bucketUrl) {
        return null;
      }

      // Then we get the stories and settings
      const dataSettings = await fetchSettings(bucketUrl);
      return dataSettings;
    },
    { enabled: !!username },
  );

  const handleFollow = async () => {
    if (!userFollowing) return;
    followUser({ userFollowing, address: address });
  };

  const handleUnfollow = async () => {
    if (!userFollowing) {
      return;
    }
    unfollowUser({ userFollowing, address: address });
  };

  // We hide users without a username
  if (!isLoadingUsername && !username) {
    return null;
  }

  const userPath = `/${username}`;
  const following = !!userFollowing?.following[address];

  const handleShowLoginPrompt = () => setShowLoginPromptDialog(true);

  const handleCancelLoginPrompt = () => setShowLoginPromptDialog(false);

  return (
    <UserCardContainer>
      <Link href="/[username]" as={userPath} passHref legacyBehavior>
        <ProfileImageContainer>
          <ProfileImage
            src={
              userSettings && userSettings.file.siteLogo
                ? userSettings.file.siteLogo
                : generateAvatar(address)
            }
          />
        </ProfileImageContainer>
      </Link>
      <Flex css={{ width: '100%' }} direction="column">
        <Flex justify="between" align="center">
          <Link href="/[username]" as={userPath} passHref legacyBehavior>
            <UserCardTitle as="a" size="subheading">
              {isLoadingUsername ? '...' : username}
            </UserCardTitle>
          </Link>
          {user?.username !== username && !isLegacy && !following && (
            <Button
              size="sm"
              color="orange"
              css={{ ml: '$5' }}
              onClick={user ? handleFollow : handleShowLoginPrompt}
            >
              Follow
            </Button>
          )}
          {user?.username !== username && !isLegacy && following && (
            <Button
              size="sm"
              variant="subtle"
              css={{ ml: '$5' }}
              onClick={handleUnfollow}
            >
              Unfollow
            </Button>
          )}
        </Flex>
        <UserCardDescription size="subheading" css={{ color: '$gray9' }}>
          {userSettings && userSettings.file.siteDescription}
        </UserCardDescription>
      </Flex>

      <LoginModal
        open={showLoginPromptDialog}
        onClose={handleCancelLoginPrompt}
      />
    </UserCardContainer>
  );
};
