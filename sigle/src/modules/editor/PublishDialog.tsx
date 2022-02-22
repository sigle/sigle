import { Story } from '../../types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Flex,
  Heading,
  Text,
} from '../../ui';
import { TwitterCardPreview } from './TwitterCardPreview';

interface PublishDialogProps {
  story: Story;
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
  onEditPreview: () => void;
}

export const PublishDialog = ({
  story,
  open,
  loading,
  onConfirm,
  onClose,
  onEditPreview,
}: PublishDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle asChild>
          <Heading as="h2" size="2xl" css={{ textAlign: 'center' }}>
            One last check
          </Heading>
        </DialogTitle>
        <DialogDescription asChild>
          <Text css={{ mb: '$5', textAlign: 'center' }}>
            Social media preview
          </Text>
        </DialogDescription>
        <TwitterCardPreview story={story} />
        <Flex justify="end" gap="6" css={{ mt: '$5' }}>
          <Button
            size="lg"
            variant="ghost"
            color="orange"
            disabled={loading}
            onClick={onEditPreview}
          >
            Edit preview
          </Button>
          <Button
            size="lg"
            color="orange"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? 'Publishing ...' : 'Publish now'}
          </Button>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
