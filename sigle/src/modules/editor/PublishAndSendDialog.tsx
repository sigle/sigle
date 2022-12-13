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
  onClose: () => void;
  onConfirm: () => void;
}

export const PublishAndSendDialog = ({
  open,
  onClose,
  onConfirm,
}: PublishAndSendDialogProps) => {
  // to be replaced with data from server
  const subscribers = 342;
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
                and sent to all {subscribers} subscribers
              </Box>
              .
            </Typography>
            <Typography size="subheading">Are you sure?</Typography>
          </Flex>
        </DialogDescription>
        <Flex justify="end" gap="6" css={{ mt: '$5' }}>
          <Button size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            css={{ gap: '$2' }}
            color="orange"
          >
            Yes, publish and send
            <PaperPlaneIcon />
          </Button>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
