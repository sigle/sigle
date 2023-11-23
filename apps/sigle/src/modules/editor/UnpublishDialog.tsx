import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Flex,
  Heading,
  Text,
  DialogClose,
} from '../../ui';

interface UnpublishDialogProps {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const UnpublishDialog = ({
  open,
  loading,
  onConfirm,
  onClose,
}: UnpublishDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle asChild>
          <Heading as="h2" size="xl" css={{ mb: '$3' }}>
            Unpublish my story
          </Heading>
        </DialogTitle>
        <DialogDescription asChild>
          <>
            <Text>You’re about to unpublish this story.</Text>
            <Text>
              It won’t be visible on your blog anymore but you still can see and
              edit it in your draft section.
            </Text>
          </>
        </DialogDescription>
        <Flex justify="end" gap="6" css={{ mt: '$6' }}>
          <DialogClose asChild>
            <Button size="lg" variant="ghost" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="lg"
            color="orange"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? 'Unpublishing ...' : 'Confirm'}
          </Button>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
