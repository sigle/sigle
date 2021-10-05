import { FaFacebookF, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { sigleConfig } from '../../../config';
import { Story } from '../../../types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  Heading,
  Text,
} from '../../../ui';
import { useAuth } from '../../auth/AuthContext';

interface StoryPublishedDialogProps {
  open: boolean;
  story: Story;
  onOpenChange: () => void;
}

const iconSize = 20;

// TODO Copy story link to work

export const StoryPublishedDialog = ({
  open,
  onOpenChange,
  story,
}: StoryPublishedDialogProps) => {
  const { user } = useAuth();

  const storyUrl = `${sigleConfig.appUrl}/${user?.username}/${story.id}`;
  const storyUrlEncoded = encodeURIComponent(storyUrl);
  const storyTitleEncoded = encodeURIComponent(story.title);
  const shareTextEncoded = encodeURIComponent(
    `I just published "${story.title}" on @sigleapp\n${storyUrl}`
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle asChild>
          <Heading as="h2" size="2xl" css={{ textAlign: 'center' }}>
            Published!
          </Heading>
        </DialogTitle>
        <DialogDescription asChild>
          <Text css={{ textAlign: 'center' }}>
            Spread the word on social media
          </Text>
        </DialogDescription>
        <Flex justify="center" gap="6" css={{ mt: '$6' }}>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareTextEncoded}`}
            target="_blank"
          >
            <FaTwitter size={iconSize} />
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${storyUrlEncoded}&title=${storyTitleEncoded}&source=Sigle`}
            target="_blank"
          >
            <FaLinkedin size={iconSize} />
          </a>
          <a
            href={`https://www.facebook.com/sharer.php?u=${storyUrlEncoded}`}
            target="_blank"
          >
            <FaFacebookF size={iconSize} />
          </a>
        </Flex>
        <Flex justify="center" css={{ mt: '$6' }}>
          <Button size="lg">Copy story link</Button>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
