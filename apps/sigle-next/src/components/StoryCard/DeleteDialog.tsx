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
  DialogDivider,
} from '@sigle/ui';
import { trpc } from '@/utils/trpc';
import { DeleteDialogDeletePostMutation } from '@/__generated__/relay/DeleteDialogDeletePostMutation.graphql';
import { useToast } from '@/hooks/useToast';

interface DeleteDialogProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export const DeleteDialog = ({
  postId,
  open,
  onOpenChange,
  onDeleted,
}: DeleteDialogProps) => {
  const utils = trpc.useContext();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const [commit, isLoadingDeletePost] =
    useMutation<DeleteDialogDeletePostMutation>(graphql`
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
    `);

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
          Sentry.captureMessage('Error deleting story', {
            extra: { errors },
          });
          console.error(errors);
          toast({
            description: `Error deleting story: ${errors[0].message}`,
            variant: 'error',
          });
          return;
        }
        if (data.updatePost) {
          setIsDeleting(true);
          utils.invalidate().then(() => {
            toast({
              description: 'Story deleted successfully',
            });
            onDeleted?.();
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
          <Typography size="md" fontWeight="bold">
            Delete my story
          </Typography>
        </DialogTitle>
        <DialogDescription asChild>
          <Flex mt="3">
            <Typography color="gray9" size="sm">
              Delete entry only hides it from your post list. Story content will
              still be viewable on IPFS.
            </Typography>
          </Flex>
        </DialogDescription>
        <DialogDivider />
        <Flex justify="end" gap="2">
          <DialogClose asChild>
            <Button size="lg" variant="light" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="lg"
            color="gray"
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
