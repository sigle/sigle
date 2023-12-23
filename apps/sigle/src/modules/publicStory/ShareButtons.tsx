import { Link2Icon, LinkedInLogoIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Tooltip } from '@radix-ui/themes';
import { Box, Flex, IconButton } from '../../ui';
import { TwitterFilledIcon, FacebookLogoIcon } from '../../icons';
import { SettingsFile, Story } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { sigleConfig } from '../../config';

interface ShareButtonsProps {
  username: string;
  story: Story;
  settings: SettingsFile;
}

export const ShareButtons = ({
  username,
  story,
  settings,
}: ShareButtonsProps) => {
  const { user } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const title = story.metaTitle ? story.metaTitle : story.title;
  const siteName = settings.siteName ? settings.siteName : username;
  const handle = settings.siteTwitterHandle
    ? `@${settings.siteTwitterHandle}`
    : siteName;

  const handleClick = () => {
    navigator.clipboard
      .writeText(`${sigleConfig.appUrl}/${username}/${story.id}`)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
        setIsOpen(true);
      });
  };

  return (
    <Flex
      css={{
        '& svg': {
          color: '$gray9',
          '&:hover': { color: '$gray11' },
          '&:active': { color: '$gray11' },
        },
      }}
      gap="6"
      className="not-prose"
    >
      <Flex gap="3">
        <Tooltip delayDuration={200} content="Share on Twitter" side="top">
          <Box
            as="a"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              title,
            )} by ${handle}&url=${sigleConfig.appUrl}/${username}/${story.id}`}
            target="_blank"
            rel="noopener"
          >
            <TwitterFilledIcon />
          </Box>
        </Tooltip>
        <Tooltip delayDuration={200} content="Share on Facebook" side="top">
          <Box
            as="a"
            href={`https://www.facebook.com/sharer/sharer.php?u=${sigleConfig.appUrl}/${siteName}/${story.id}&quote=${title} by ${username}`}
            target="_blank"
            rel="noopener"
          >
            <FacebookLogoIcon />
          </Box>
        </Tooltip>
        <Tooltip delayDuration={200} content="Share on LinkedIn" side="top">
          <Box
            as="a"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${sigleConfig.appUrl}/${user?.username}/${story.id}`}
            target="_blank"
            rel="noopener"
          >
            <LinkedInLogoIcon />
          </Box>
        </Tooltip>
      </Flex>
      <Tooltip
        open={isOpen}
        onOpenChange={() => setIsOpen(!isOpen)}
        delayDuration={200}
        content={isCopied ? 'Copied!' : 'Copy link'}
        side="top"
      >
        <IconButton
          disabled={isCopied}
          css={{
            width: 15,
            height: 15,
            p: 0,
            '&:hover': { backgroundColor: 'transparent' },
            '&:active': { backgroundColor: 'transparent' },
          }}
          onClick={handleClick}
        >
          <Link2Icon />
        </IconButton>
      </Tooltip>
    </Flex>
  );
};
