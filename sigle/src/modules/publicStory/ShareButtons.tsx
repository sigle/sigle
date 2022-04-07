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
import { Story } from '../../types';
import { useState } from 'react';
import { darkTheme } from '../../stitches.config';

interface ShareButtonsProps {
  story: Story;
}

export const ShareButtons = ({ story }: ShareButtonsProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const title = story.metaTitle ? story.metaTitle : story.title;

  const handleClick = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  if (typeof window === 'undefined') {
    return null;
  }

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
              href={`https://twitter.com/intent/tweet?text=${title}&url=${window.location.href}`}
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
              href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${title}`}
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
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`}
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
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <IconButton
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
