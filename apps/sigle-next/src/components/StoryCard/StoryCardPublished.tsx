import Link from 'next/link';
import { useRouter } from 'next/router';
import { TbDots } from 'react-icons/tb';
import Image from 'next/image';
import { useState } from 'react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  IconButton,
  Typography,
} from '@sigle/ui';
import { styled } from '@sigle/stitches.config';
import { nextImageLoader } from '@/utils/nextImageLoader';
import { addressAvatar } from '@/utils';
import { getAddressFromDid } from '@/utils/getAddressFromDid';
import { CeramicPost, CeramicProfile } from '@/types/ceramic';
import { BadgeAddress } from '../UserProfile/BadgeAddress';
import { DeleteDialog } from './DeleteDialog';

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
  post: CeramicPost;
  profile?: CeramicProfile;
  isViewer: boolean;
}

export const StoryCardPublished = ({
  post,
  profile,
  isViewer,
}: StoryCardPublishedProps) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const storyEditorLink = `/editor/${post.id}`;
  const storyReadLink = `/post/${post.id}`;
  const userProfileLink = `/profile/${post.did}`;
  const address = getAddressFromDid(post.did);

  return (
    <>
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
          <Typography size="xs" color="gray9" textTransform="uppercase">
            {format(new Date(post.createdAt), 'MMM dd')}
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
            {post.title}
          </Typography>
        </Link>
        <Link href={storyReadLink}>
          <Typography size="sm" color="gray9" css={{ mt: '$2' }} lineClamp={3}>
            {post.excerpt}
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
                {profile?.displayName
                  ? profile.displayName
                  : `${address.split('').slice(0, 5).join('')}…${address
                      .split('')
                      .slice(-5)
                      .join('')}`}
              </Typography>
            </Link>
            <BadgeAddress did={post.did} />
          </Flex>
          {isViewer ? (
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
                <StyledDropdownMenuItem
                  color="orange"
                  onSelect={() => setIsDeleteDialogOpen(true)}
                >
                  Delete
                </StyledDropdownMenuItem>
              </StyledDropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </Flex>
      </Flex>

      <DeleteDialog
        postId={post.id}
        open={isDeleteDialogOpen}
        onOpenChange={(isOpen) => setIsDeleteDialogOpen(isOpen)}
      />
    </>
  );
};
