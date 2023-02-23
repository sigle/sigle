import Link from 'next/link';
import Image from 'next/image';
import { Button, Flex, Typography } from '@sigle/ui';
import { styled } from '@sigle/stitches.config';
import { getAddressFromDid } from '@/utils/getAddressFromDid';
import { shortenAddress } from '@/utils/shortenAddress';
import { addressAvatar } from '@/utils';
import { nextImageLoader } from '@/utils/nextImageLoader';
import { trpc } from '@/utils/trpc';

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
  did: string;
  isViewer: boolean;
}

export const UserProfilePageHeader = ({
  isViewer,
  did,
}: UserProfilePageHeaderProps) => {
  const profile = trpc.userProfile.useQuery({ did });

  const address = getAddressFromDid(did);

  if (profile.isLoading) {
    return null;
  }

  if (isViewer) {
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
          {profile.data?.displayName || shortenAddress(address)}'s profile
        </Typography>
      </Flex>
      <Flex gap="2">
        <Button>Follow</Button>
        <Button color="indigo">Subscribe</Button>
      </Flex>
    </Flex>
  );
};
