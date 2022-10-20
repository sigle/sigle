import Link from 'next/link';
import { styled } from '../../stitches.config';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  Typography,
} from '../../ui';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const PromptImageContainer = styled('div', {
  br: '$1',
  overflow: 'hidden',
  width: '100%',
  height: '100%',
});

const PromptImage = styled('img', {
  width: '100%',
  height: '100%',
  maxWidth: '100%',
  maxHeight: 187,
  objectFit: 'cover',
});

export const LoginModal = ({ open, onClose }: LoginModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent css={{ p: '$5', maxWidth: 490 }} closeButton={false}>
        <PromptImageContainer>
          <PromptImage src="/static/img/prompt_image.png" />
        </PromptImageContainer>
        <DialogTitle asChild>
          <Typography css={{ fontWeight: 600, my: '$3' }} size="h3">
            Login to continue
          </Typography>
        </DialogTitle>
        <DialogDescription asChild>
          <Typography size="subheading">
            To follow writers on Sigle, you must first be connected. <br /> Go
            to the login page?
          </Typography>
        </DialogDescription>
        <Flex justify="end" gap="5" css={{ mt: '$5' }}>
          <Button size="lg" variant="ghost" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Link href="/login" passHref>
            <Button as="a" size="lg" color="orange">
              Yes, go to login page
            </Button>
          </Link>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
