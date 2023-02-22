import Link from 'next/link';
import { useRouter } from 'next/router';
import { TbDots } from 'react-icons/tb';
import { graphql, useFragment } from 'react-relay';
import Image from 'next/image';
import {
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  IconButton,
  Typography,
} from '@sigle/ui';
import { styled } from '@sigle/stitches.config';
import { StoryCardPublishedGraphQL_post$key } from '@/__generated__/relay/StoryCardPublishedGraphQL_post.graphql';
import { nextImageLoader } from '@/utils/nextImageLoader';
import { addressAvatar } from '@/utils';
import { getAddressFromDid } from '@/utils/getAddressFromDid';
import { BadgeAddress } from '../UserProfile/BadgeAddress';

const AvatarContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  overflow: 'hidden',
  width: 24,
  height: 24,
  br: '$xs',
});

const StyledDropdownMenuItem = styled(DropdownMenuItem, {
  color: '$orange11',
});

const StyledDropdownMenuContent = styled(DropdownMenuContent, {
  minWidth: 100,
});

interface StoryCardPublishedProps {
  story: StoryCardPublishedGraphQL_post$key;
}

export const StoryCardPublishedGraphQL = (props: StoryCardPublishedProps) => {
  const router = useRouter();

  const storyData = useFragment(
    graphql`
      fragment StoryCardPublishedGraphQL_post on Post {
        id
        title
        author {
          id
          isViewer
          profile {
            id
            displayName
          }
        }
      }
    `,
    props.story
  );

  const storyEditorLink = `/editor/${storyData.id}`;
  const storyReadLink = `/post/${storyData.id}`;
  const userProfileLink = `/profile/${storyData.author.id}`;
  const address = getAddressFromDid(storyData.author.id);

  return (
    <Flex
      direction="column"
      css={{
        borderTop: '1px solid $gray6',
        py: '$6',
        '&:first-child': {
          borderTop: 'none',
        },
      }}
    >
      <Flex gap="2">
        <Typography size="xs" color="gray9">
          FEB 18
        </Typography>
        <Typography size="xs" color="gray9">
          ·
        </Typography>
        <Typography size="xs" color="gray9">
          8 MIN READ
        </Typography>
      </Flex>
      <Link href={storyReadLink}>
        <Typography
          size="lg"
          fontWeight="bold"
          lineClamp={2}
          css={{ mt: '$3' }}
        >
          {storyData.title}
        </Typography>
      </Link>
      <Link href={storyReadLink}>
        <Typography size="sm" color="gray9" css={{ mt: '$2' }} lineClamp={3}>
          Blockchain has completely changed the way we think about money and
          created a true era of digital property. Bitcoin is the first
          successful use case for blockchain. Some creative developers believe
          Bitcoin is the first successful use case for blockchain. Some creative
          developers believe Bitcoin is the first successful use case for
          blockchain.
        </Typography>
      </Link>
      <Flex justify="between" align="center" css={{ mt: '$6' }}>
        <Flex gap="2" align="center">
          <Link href={userProfileLink}>
            <AvatarContainer>
              <Image
                loader={nextImageLoader}
                src={addressAvatar(address, 24)}
                alt="Picture of the author"
                width={24}
                height={24}
              />
            </AvatarContainer>
          </Link>
          <Link href={userProfileLink}>
            <Typography size="xs">
              {storyData.author.profile?.displayName
                ? storyData.author.profile.displayName
                : `${address.split('').slice(0, 5).join('')}…${address
                    .split('')
                    .slice(-5)
                    .join('')}`}
            </Typography>
          </Link>
          <BadgeAddress did={storyData.author.id} />
        </Flex>
        {storyData.author.isViewer ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton size="xs" variant="ghost">
                <TbDots />
              </IconButton>
            </DropdownMenuTrigger>
            <StyledDropdownMenuContent side="left" align="end">
              <DropdownMenuItem onSelect={() => router.push(storyEditorLink)}>
                Edit
              </DropdownMenuItem>
              <StyledDropdownMenuItem onSelect={() => alert('TODO')}>
                Delete
              </StyledDropdownMenuItem>
            </StyledDropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </Flex>
    </Flex>
  );
};
