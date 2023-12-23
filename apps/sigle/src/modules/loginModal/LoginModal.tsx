import { CheckCircledIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog, Heading } from '@radix-ui/themes';
import { Button, Flex, Typography } from '../../ui';

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
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Content size="3" className="text-center">
        <Image
          width={527}
          height={187}
          alt="Illustration of someone using a pencil as a pole vault stick."
          src="/static/img/login_to_continue_low_2.png"
        />
        <Dialog.Title asChild>
          <Heading mt="4" size="2" as="h4">
            Login to continue
          </Heading>
        </Dialog.Title>
        <Dialog.Description className="mt-1">
          Connect your wallet and experience the full potential of Sigle.
        </Dialog.Description>
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
      </Dialog.Content>
    </Dialog.Root>
  );
};
