import { CheckCircledIcon } from '@radix-ui/react-icons';
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
  const sigleFeatures = [
    'Build your community',
    'Create your feed',
    'Get insight analytics',
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent css={{ p: '$5' }} closeButton={false}>
        <PromptImageContainer>
          <PromptImage src="/static/img/login_to_continue_low_2.png" />
        </PromptImageContainer>
        <DialogTitle asChild>
          <Typography css={{ fontWeight: 600, mt: '$4' }} size="h3">
            Login to continue
          </Typography>
        </DialogTitle>
        <DialogDescription asChild>
          <Typography css={{ mt: '$1' }} size="subheading">
            Connect your wallet and experience the full potential of Sigle.
          </Typography>
        </DialogDescription>
        <Flex gap="3" css={{ mt: '$4' }}>
          {sigleFeatures.map((feature) => (
            <Typography
              key={feature}
              css={{
                display: 'flex',
                alignItems: 'center',
                '& svg': {
                  color: '$green11',
                  mr: '$1',
                },
              }}
              size="subheading"
            >
              <CheckCircledIcon />
              {feature}
            </Typography>
          ))}
        </Flex>
        <Flex justify="end" gap="5" css={{ mt: '$6' }}>
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
