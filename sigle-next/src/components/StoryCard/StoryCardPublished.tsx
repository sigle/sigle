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
import { StoryCardPublished_post$key } from '@/__generated__/relay/StoryCardPublished_post.graphql';
import { nextImageLoader } from '@/utils/nextImageLoader';
import { addressAvatar } from '@/utils';
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
  did: string;
  story: StoryCardPublished_post$key;
}

export const StoryCardPublished = (props: StoryCardPublishedProps) => {
  const router = useRouter();

  const storyData = useFragment(
    graphql`
      fragment StoryCardPublished_post on Post {
        id
        title
      }
    `,
    props.story
  );

  const storyEditorLink = `/editor/${storyData.id}`;

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
      <Link href={storyEditorLink}>
        <Typography
          size="lg"
          fontWeight="bold"
          lineClamp={2}
          css={{ mt: '$3' }}
        >
          {storyData.title}
        </Typography>
      </Link>
      <Link href={storyEditorLink}>
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
          <AvatarContainer>
            <Image
              loader={nextImageLoader}
              src={addressAvatar('TODO', 24)}
              alt="Picture of the author"
              width={24}
              height={24}
            />
          </AvatarContainer>
          <Typography size="xs">Motoki Tonn</Typography>
          <BadgeAddress did={props.did} />
        </Flex>
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
      </Flex>
    </Flex>
  );
};
