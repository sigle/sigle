import { FacebookLogoIcon } from '@/icons/FacebookLogoIcon';
import { LinkedinIcon } from '@/icons/LinkedinIcon';
import { TwitterFilledIcon } from '@/icons/TwitterFilledIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/Tooltip';
import { IconLink } from '@tabler/icons-react';
import { useState } from 'react';

export const ShareSocial = ({
  post,
}: {
  post: {
    title: string;
  };
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const websiteUrl = location.href;

  const handleClickCopy = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText(websiteUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      setIsOpen(true);
    });
  };

  return (
    <TooltipProvider>
      <div className="mt-5">
        <p className="font-bold text-[0.625rem] text-gray-500 uppercase tracking-wide">
          Share this article
        </p>
        <div className="mt-3 flex gap-3">
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  post.title
                )}&url=${websiteUrl}`}
                target="_blank"
                rel="noopener"
              >
                <TwitterFilledIcon />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share on Twitter</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${websiteUrl}&quote=${post.title}`}
                target="_blank"
                rel="noopener"
              >
                <FacebookLogoIcon />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share on Facebook</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${websiteUrl}`}
                target="_blank"
                rel="noopener"
              >
                <LinkedinIcon size={15} />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share on LinkedIn</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip
            open={isOpen}
            onOpenChange={() => setIsOpen(!isOpen)}
            delayDuration={200}
          >
            <TooltipTrigger asChild>
              <a href={websiteUrl} onClick={handleClickCopy}>
                <IconLink size={15} />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isCopied ? 'Copied!' : 'Copy link'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
