import Image from 'next/image';
import Link from 'next/link';
import { TbBrandTwitter, TbLink, TbPencil } from 'react-icons/tb';
import { Button, Flex, Typography } from '@sigle/ui';
import { styled } from '@sigle/stitches.config';
import { nextImageLoader } from '@/utils/nextImageLoader';
import { addressAvatar } from '@/utils';
import { prettifyUrl } from '@/utils/prettifyUrl';
import { getAddressFromDid } from '@/utils/getAddressFromDid';
import { shortenAddress } from '@/utils/shortenAddress';
import { trpc } from '@/utils/trpc';
import { BadgeAddress } from './BadgeAddress';
import { UserProfileSkeleton } from './UserProfileSkeleton';

const AvatarContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  overflow: 'hidden',
  width: 72,
  height: 72,
  br: '$sm',
});

interface UserProfileProps {
  did: string;
  isViewer: boolean;
}

export const UserProfile = ({ isViewer, did }: UserProfileProps) => {
  const profile = trpc.userProfile.useQuery({ did });

  const address = getAddressFromDid(did);

  if (profile.isLoading) {
    return <UserProfileSkeleton />;
  }

  return (
    <>
      <Flex justify="between" align="start">
        <AvatarContainer>
          <Image
            loader={nextImageLoader}
            src={addressAvatar(address, 72)}
            alt="Picture of the author"
            width={72}
            height={72}
          />
        </AvatarContainer>
        {isViewer ? (
          <Link href="/settings">
            <Button
              variant="light"
              size="sm"
              rightIcon={<TbPencil size={16} />}
            >
              Edit profile
            </Button>
          </Link>
        ) : null}
      </Flex>

      <Flex mt="2" gap="3" align="center">
        <Typography size="lg" fontWeight="semiBold">
          {profile.data?.displayName || shortenAddress(address)}
        </Typography>
        <BadgeAddress did={did} />
      </Flex>

      <Flex mt="3" gap="3">
        <Typography size="sm">
          106{' '}
          <Typography as="span" size="sm" color="gray9">
            Following
          </Typography>
        </Typography>
        <Typography size="sm">
          3,209{' '}
          <Typography as="span" size="sm" color="gray9">
            Followers
          </Typography>
        </Typography>
      </Flex>

      <Flex mt="3">
        <Typography size="sm" color="gray9">
          {profile.data?.description}
        </Typography>
      </Flex>

      <Flex mt="5" gap="3" align="center">
        {profile.data?.websiteUrl && (
          <Link href={profile.data.websiteUrl} target="_blank">
            <Flex align="center" gap="1">
              <Typography size="sm" color="gray9">
                <TbLink size={16} />
              </Typography>
              <Typography size="sm" color="indigo">
                {prettifyUrl(profile.data.websiteUrl)}
              </Typography>
            </Flex>
          </Link>
        )}
        {profile.data?.twitterUsername && (
          <Link
            href={`https://twitter.com/${profile.data.twitterUsername}`}
            target="_blank"
          >
            <Typography size="sm">
              <TbBrandTwitter fill="currentColor" stroke="0" size={16} />
            </Typography>
          </Link>
        )}
      </Flex>
    </>
  );
};
