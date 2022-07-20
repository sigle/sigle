import { lookupProfile } from '@stacks/auth';
import { NamesApi } from '@stacks/blockchain-api-client';
import Link from 'next/link';
import { useQuery } from 'react-query';
import { sigleConfig } from '../../config';
import { useUserFollow, useUserUnfollow } from '../../hooks/appData';
import { styled } from '../../stitches.config';
import { Button, Flex, Typography } from '../../ui';
import { GaiaUserFollowing } from '../../utils';
import { generateAvatar } from '../../utils/boringAvatar';
import { fetchSettings } from '../../utils/gaia/fetch';

const UserCardContainer = styled('div', {
  display: 'flex',
  borderBottom: '1px solid $colors$gray6',
  py: '$3',
  gap: '$5',
});

const ProfileImageContainer = styled('a', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  br: '$1',
  overflow: 'hidden',
  width: 38,
  height: 38,
  flex: 'none',
});

const ProfileImage = styled('img', {
  width: 'auto',
  height: '100%',
  maxWidth: 38,
  maxHeight: 38,
  objectFit: 'cover',
});

const UserCardDescription = styled(Typography, {
  mt: '$1',
  overflow: 'hidden',
  display: '-webkit-box',
  '-webkit-line-clamp': 2,
  '-webkit-box-orient': 'vertical',
  typographyOverflow: 'ellipsis',
  maxWidth: 600,
});

interface UserCardProps {
  address: string;
  userFollowing: GaiaUserFollowing;
}

export const UserCard = ({ address, userFollowing }: UserCardProps) => {
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
    }
  );

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
    { enabled: !!username }
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

  const userPath = `/${username}`;
  const following = !!userFollowing.following[address];

  return (
    <UserCardContainer>
      <Link href="/[username]" as={userPath} passHref>
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
          <Link href="/[username]" as={userPath} passHref>
            <Typography
              as="a"
              size="subheading"
              css={{
                fontWeight: 600,
              }}
            >
              {isLoadingUsername ? '...' : username}
            </Typography>
          </Link>
          {!following ? (
            <Button color="orange" css={{ ml: '$5' }} onClick={handleFollow}>
              Follow
            </Button>
          ) : (
            <Button
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
    </UserCardContainer>
  );
};
