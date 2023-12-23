import { useEffect, useState } from 'react';
import { Button, Dialog, Flex, Heading, Text } from '@radix-ui/themes';
import { TwitterLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons';
import posthog from 'posthog-js';
import { sigleConfig } from '../../config';
import { Story } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { FacebookLogo } from '../../icons';

interface PublishedDialogProps {
  open: boolean;
  story: Story;
  onOpenChange: () => void;
}

const iconSize = 20;

export const PublishedDialog = ({
  open,
  onOpenChange,
  story,
}: PublishedDialogProps) => {
  const { user } = useAuth();

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isCopied]);

  const storyUrl = `${sigleConfig.appUrl}/${user?.username}/${story.id}`;
  const storyUrlEncoded = encodeURIComponent(storyUrl);
  const storyTitleEncoded = encodeURIComponent(story.title);
  const shareTextEncoded = encodeURIComponent(
    `I just published "${story.title}" on @sigleapp\n${storyUrl}`,
  );

  const handleCopy = () => {
    posthog.capture('publish-story-dialog-copy', { id: story.id });
    navigator.clipboard.writeText(storyUrl);
    setIsCopied(true);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="3" className="max-w-[450px]">
        <Dialog.Title asChild>
          <Heading as="h2" size="2" className="text-center">
            Published!
          </Heading>
        </Dialog.Title>
        <Dialog.Description className="text-center">
          Spread the word on social media
        </Dialog.Description>
        <Flex justify="center" gap="6" mt="6">
          <a
            href={`https://twitter.com/intent/tweet?text=${shareTextEncoded}`}
            target="_blank"
            rel="noreferrer"
          >
            <TwitterLogoIcon height={iconSize} width={iconSize} />
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${storyUrlEncoded}&title=${storyTitleEncoded}&source=Sigle`}
            target="_blank"
            rel="noreferrer"
          >
            <LinkedInLogoIcon height={iconSize} width={iconSize} />
          </a>
          <a
            href={`https://www.facebook.com/sharer.php?u=${storyUrlEncoded}`}
            target="_blank"
            rel="noreferrer"
          >
            <FacebookLogo height={iconSize} width={iconSize} />
          </a>
        </Flex>
        <Flex justify="center" mt="6">
          <Button size="3" variant="ghost" color="orange" onClick={handleCopy}>
            {isCopied ? 'Copied!' : 'Copy story link'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
