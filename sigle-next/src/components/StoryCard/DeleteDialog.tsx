import { graphql, useMutation } from 'react-relay';
import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';
import {
  Button,
  Flex,
  Typography,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@sigle/ui';
import { trpc } from '@/utils/trpc';
import { DeleteDialogDeletePostMutation } from '@/__generated__/relay/DeleteDialogDeletePostMutation.graphql';

interface DeleteDialogProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteDialog = ({
  postId,
  open,
  onOpenChange,
}: DeleteDialogProps) => {
  const utils = trpc.useContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const [commit, isLoadingDeletePost] =
    useMutation<DeleteDialogDeletePostMutation>(
      graphql`
        mutation DeleteDialogDeletePostMutation($input: UpdatePostInput!) {
          updatePost(input: $input) {
            clientMutationId
            document {
              id
              status
              title
              content
            }
          }
        }
      `
    );

  const handleDelete = () => {
    commit({
      variables: {
        input: {
          id: postId,
          content: {
            status: 'DELETED',
            title: '',
            content: '',
          },
        },
      },
      onCompleted: (data, errors) => {
        if (errors) {
          // TODO toast error
          Sentry.captureMessage('Error updating story', {
            extra: { errors },
          });
          return;
        }
        if (data.updatePost) {
          setIsDeleting(true);
          utils.invalidate().then(() => {
            // TODO toast success;
          });
        }
      },
    });
  };

  const isLoading = isLoadingDeletePost || isDeleting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle asChild>
          <Typography size="xl">Delete my story</Typography>
        </DialogTitle>
        <DialogDescription asChild>
          <Flex mt="3" direction="column">
            <Typography>
              Story content will still be viewable on IPFS. Remove entry only
              hides it from your post list.
            </Typography>
          </Flex>
        </DialogDescription>
        <Flex justify="end" gap="6" css={{ mt: '$6' }}>
          <DialogClose asChild>
            <Button size="lg" variant="ghost" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="lg"
            color="indigo"
            disabled={isLoading}
            onClick={handleDelete}
          >
            {isLoading ? 'Deleting ...' : 'Confirm'}
          </Button>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
