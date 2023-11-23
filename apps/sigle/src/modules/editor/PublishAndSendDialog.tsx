import { PaperPlaneIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  Typography,
} from '../../ui';

interface PublishAndSendDialogProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PublishAndSendDialog = ({
  open,
  loading,
  onClose,
  onConfirm,
}: PublishAndSendDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent closeButton={false} css={{ p: '$5', br: 28 }}>
        <Image
          width={484}
          height={214}
          alt="Illustration of someone using a pencil as a pole vault stick."
          src="/static/img/login_to_continue_low_2.png"
        />
        <DialogTitle asChild>
          <Typography css={{ fontWeight: 600, mt: '$4' }} size="h3">
            One last check
          </Typography>
        </DialogTitle>
        <DialogDescription asChild>
          <Flex direction="column" gap="5">
            <Typography css={{ mt: '$1' }} size="subheading">
              Your post will be published on your profile{' '}
              <Box css={{ fontWeight: 600 }} as="span">
                {' '}
                and sent to all your subscribers
              </Box>
              .
            </Typography>
            <Typography size="subheading">Are you sure?</Typography>
          </Flex>
        </DialogDescription>
        <Flex justify="end" gap="6" css={{ mt: '$5' }}>
          <Button
            size="lg"
            variant="ghost"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={onConfirm}
            css={{ gap: '$2' }}
            color="orange"
            disabled={loading}
          >
            {loading ? 'Sending ...' : 'Publish and send'}
            <PaperPlaneIcon />
          </Button>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
