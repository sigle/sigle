import Image from 'next/image';
import Link from 'next/link';
import { TbBrandTwitter, TbLink, TbPencil } from 'react-icons/tb';
import { graphql, useFragment } from 'react-relay';
import { Badge, Button, Flex, Typography } from '@sigle/ui';
import { styled } from '@sigle/stitches.config';
import { nextImageLoader } from '@/utils/nextImageLoader';
import { addressAvatar } from '@/utils';
import { UserProfile_profile$key } from '@/__generated__/relay/UserProfile_profile.graphql';
import { prettifyUrl } from '@/utils/prettifyUrl';
import { BadgeAddress } from './BadgeAddress';

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
  profile: UserProfile_profile$key | null;
}

export const UserProfile = (props: UserProfileProps) => {
  const profileData = useFragment(
    graphql`
      fragment UserProfile_profile on Profile {
        id
        displayName
        description
        websiteUrl
        twitterUsername
      }
    `,
    props.profile
  );

  // TODO handle case where profile is null

  return (
    <>
      <Flex justify="between">
        <AvatarContainer>
          <Image
            loader={nextImageLoader}
            src={addressAvatar('TODO', 72)}
            alt="Picture of the author"
            width={72}
            height={72}
          />
        </AvatarContainer>
        <Link href="/settings">
          <Button variant="light" size="sm" rightIcon={<TbPencil size={16} />}>
            Edit profile
          </Button>
        </Link>
      </Flex>

      <Flex mt="2" gap="3" align="center">
        <Typography size="lg" fontWeight="semiBold">
          {profileData?.displayName}
        </Typography>
        <BadgeAddress did={props.did} />
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
          {profileData?.description}
        </Typography>
      </Flex>

      <Flex mt="5" gap="3" align="center">
        {profileData?.websiteUrl && (
          <Link href={profileData.websiteUrl} target="_blank">
            <Flex align="center" gap="1">
              <Typography size="sm" color="gray9">
                <TbLink size={16} />
              </Typography>
              <Typography size="sm" color="indigo">
                {prettifyUrl(profileData.websiteUrl)}
              </Typography>
            </Flex>
          </Link>
        )}
        {profileData?.twitterUsername && (
          <Link
            href={`https://twitter.com/${profileData.twitterUsername}`}
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
