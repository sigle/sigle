import { styled } from '../../stitches.config';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  FormHelper,
  FormInput,
  Typography,
} from '../../ui';

const HeaderLogoContainer = styled('div', {
  mx: 'auto',
  width: 64,
  height: 64,
  display: 'flex',
  justifyContent: 'center',
  br: '$4',
  overflow: 'hidden',
  mb: '$2',
});

const HeaderLogo = styled('img', {
  width: 'auto',
  height: '100%',
  maxWidth: 64,
  maxHeight: 64,
  objectFit: 'cover',
});

interface SubscribeModalProps {
  open: boolean;
  onClose: () => void;
  profileImgSrc: string;
  siteName: string | undefined;
}

export const SubscribeModal = ({
  profileImgSrc,
  siteName,
  open,
  onClose,
}: SubscribeModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent css={{ p: '$5', br: 28 }} closeButton={false}>
        <Box as="form">
          <HeaderLogoContainer>
            <HeaderLogo src={profileImgSrc} alt={`${siteName} logo`} />
          </HeaderLogoContainer>
          <DialogTitle asChild>
            <Typography
              css={{ fontWeight: 600, mt: '$4', textAlign: 'center' }}
              size="h3"
            >
              {siteName}
            </Typography>
          </DialogTitle>
          <DialogDescription asChild>
            <Typography
              css={{ mt: '$1', mb: '$6', textAlign: 'center' }}
              size="subheading"
            >
              {`            Enter your email to receive ${siteName}'s new stories in your 
            mailbox`}
            </Typography>
          </DialogDescription>
          <FormInput
            css={{ width: '100%' }}
            type="email"
            placeholder="johndoe@gmail.com"
          />
          <FormHelper css={{ mt: '$2', color: '$gray11', fontSize: '$1' }}>
            Your email address will be saved in the settings for future
            subscriptions
          </FormHelper>
          <Flex justify="end" gap="5" css={{ mt: '$6' }}>
            <Button size="lg" variant="ghost" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="lg" color="orange">
              Submit
            </Button>
          </Flex>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
