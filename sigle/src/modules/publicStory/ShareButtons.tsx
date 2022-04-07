import {
  Box,
  Flex,
  IconButton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../ui';
import { TwitterFilledIcon, FacebookLogoIcon } from '../../icons';
import { Link2Icon, LinkedInLogoIcon } from '@radix-ui/react-icons';
import { SettingsFile, Story } from '../../types';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { sigleConfig } from '../../config';

interface ShareButtonsProps {
  story: Story;
  settings: SettingsFile;
}

export const ShareButtons = ({ story, settings }: ShareButtonsProps) => {
  const { user } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const title = story.metaTitle ? story.metaTitle : story.title;
  const username = settings.siteName ? settings.siteName : user?.username;

  const handleClick = () => {
    navigator.clipboard
      .writeText(`${sigleConfig.appUrl}/${user?.username}/${story.id}`)
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
    >
      <Flex gap="3">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Box
              as="a"
              href={`https://twitter.com/intent/tweet?text=${title} by ${username}&url=${sigleConfig.appUrl}/${user?.username}/${story.id}`}
              target="_blank"
              rel="noopener"
            >
              <TwitterFilledIcon />
            </Box>
          </TooltipTrigger>
          <TooltipContent css={{ boxShadow: 'none' }} side="top" sideOffset={8}>
            Share on Twitter
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Box
              as="a"
              href={`https://www.facebook.com/sharer/sharer.php?u=${sigleConfig.appUrl}/${user?.username}/${story.id}&quote=${title} by ${username}`}
              target="_blank"
              rel="noopener"
            >
              <FacebookLogoIcon />
            </Box>
          </TooltipTrigger>
          <TooltipContent css={{ boxShadow: 'none' }} side="top" sideOffset={8}>
            Share on Facebook
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Box
              as="a"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${sigleConfig.appUrl}/${user?.username}/${story.id}`}
              target="_blank"
              rel="noopener"
            >
              <LinkedInLogoIcon />
            </Box>
          </TooltipTrigger>
          <TooltipContent css={{ boxShadow: 'none' }} side="top" sideOffset={8}>
            Share on LinkedIn
          </TooltipContent>
        </Tooltip>
      </Flex>
      <Tooltip
        open={isOpen}
        onOpenChange={() => setIsOpen(!isOpen)}
        delayDuration={200}
      >
        <TooltipTrigger asChild>
          <IconButton
            disabled={isCopied}
            css={{
              p: 0,
              '&:hover': { backgroundColor: 'transparent' },
              '&:active': { backgroundColor: 'transparent' },
            }}
            onClick={handleClick}
          >
            <Link2Icon />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent
          css={{
            boxShadow: 'none',
            backgroundColor: isCopied ? '$green11' : '$gray3',
            color: isCopied ? '$gray1' : '$gray11',
          }}
          side="top"
          sideOffset={8}
        >
          {isCopied ? 'Copied!' : 'Copy link'}
        </TooltipContent>
      </Tooltip>
    </Flex>
  );
};
