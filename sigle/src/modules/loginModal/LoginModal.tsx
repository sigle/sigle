import { CheckCircledIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import Link from 'next/link';
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

export const LoginModal = ({ open, onClose }: LoginModalProps) => {
  const sigleFeatures = [
    'Build your community',
    'Create your feed',
    'Get insight analytics',
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent css={{ p: '$5' }} closeButton={false}>
        <Image
          width={527}
          height={187}
          alt="Illustration of someone using a pencil as a pole vault stick."
          src="/static/img/login_to_continue_low_2.png"
        />
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
          <Link href="/login" passHref legacyBehavior>
            <Button as="a" size="lg" color="orange">
              Yes, go to login page
            </Button>
          </Link>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
