import Link from 'next/link';
import { graphql, useFragment } from 'react-relay';
import Image from 'next/image';
import { Button, Flex, Typography } from '@sigle/ui';
import { styled } from '@sigle/stitches.config';
import { UserProfilePageHeader_user$key } from '@/__generated__/relay/UserProfilePageHeader_user.graphql';
import { getAddressFromDid } from '@/utils/getAddressFromDid';
import { shortenAddress } from '@/utils/shortenAddress';
import { addressAvatar } from '@/utils';
import { nextImageLoader } from '@/utils/nextImageLoader';

const AvatarContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  overflow: 'hidden',
  width: 36,
  height: 36,
  br: '$sm',
});

interface UserProfilePageHeaderProps {
  user: UserProfilePageHeader_user$key | null;
}

export const UserProfilePageHeader = (props: UserProfilePageHeaderProps) => {
  const user = useFragment(
    graphql`
      fragment UserProfilePageHeader_user on CeramicAccount {
        id
        isViewer
        profile {
          id
          displayName
        }
      }
    `,
    props.user
  );

  if (!user) return null;

  if (user.isViewer) {
    return (
      <Flex justify="between" align="center" css={{ flex: 1 }}>
        <Typography size="xl" fontWeight="bold">
          Profile
        </Typography>
        <Link href="/editor/new">
          <Button>Write story</Button>
        </Link>
      </Flex>
    );
  }

  const address = getAddressFromDid(user.id);

  return (
    <Flex justify="between" align="center" css={{ flex: 1 }}>
      <Flex gap="2" align="center">
        <AvatarContainer>
          <Image
            loader={nextImageLoader}
            src={addressAvatar(address, 36)}
            alt="Picture of the author"
            width={36}
            height={36}
          />
        </AvatarContainer>
        <Typography size="xl" fontWeight="bold">
          {user?.profile?.displayName || shortenAddress(address)}'s profile
        </Typography>
      </Flex>
      <Flex gap="2">
        <Button>Follow</Button>
        <Button color="indigo">Subscribe</Button>
      </Flex>
    </Flex>
  );
};
