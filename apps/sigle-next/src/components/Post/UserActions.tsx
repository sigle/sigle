import type { paths } from '@/__generated__/sigle-api/openapi';
import { resolveImageUrl } from '@/lib/images';
import { Routes } from '@/lib/routes';
import { formatReadableAddress } from '@/lib/stacks';
import { Avatar, Button, IconButton, Text, Tooltip } from '@radix-ui/themes';
import NextLink from 'next/link';
import { useState } from 'react';
import { PostCollectDialog } from '../Shared/Post/PostCollectDialog';
import { IconShare } from '@tabler/icons-react';
import { PostShareDialog } from '../Shared/Post/PostShareDialog';

interface PostUserActionsProps {
  post: paths['/api/posts/{postId}']['get']['responses']['200']['content']['application/json'];
}

export const PostUserActions = ({ post }: PostUserActionsProps) => {
  const [collectDialogOpen, setCollectDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const canCollect = post.maxSupply === 0 || post.collected < post.maxSupply;

  return (
    <>
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NextLink href={Routes.userProfile({ username: post.user.id })}>
            <Avatar
              size="2"
              fallback="T"
              radius="full"
              src={
                post.user.profile?.pictureUri
                  ? resolveImageUrl(post.user.profile.pictureUri)
                  : undefined
              }
            />
          </NextLink>
          <div className="grid gap-0.5">
            <Text size="2" weight="medium" asChild>
              <NextLink href={Routes.userProfile({ username: post.user.id })}>
                {post.user.profile?.displayName}
              </NextLink>
            </Text>
            <Text size="1" color="gray" title={post.user.id} asChild>
              <NextLink href={Routes.userProfile({ username: post.user.id })}>
                {formatReadableAddress(post.user.id)}
              </NextLink>
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Tooltip content={'Share'}>
            <IconButton
              variant="ghost"
              color="gray"
              size="2"
              onClick={() => setShareDialogOpen(true)}
            >
              <IconShare size={16} />
            </IconButton>
          </Tooltip>
          <Button
            color="gray"
            highContrast
            disabled={!canCollect}
            onClick={() => setCollectDialogOpen(true)}
          >
            Collect
          </Button>
        </div>
      </div>

      <PostShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        post={post}
      />
      <PostCollectDialog
        post={post}
        open={collectDialogOpen}
        onOpenChange={setCollectDialogOpen}
      />
    </>
  );
};
