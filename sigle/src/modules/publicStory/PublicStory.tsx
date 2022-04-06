import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import readingTime from 'reading-time';
import { useEffect, useMemo, useState } from 'react';
import { SettingsFile, Story } from '../../types';
import { sanitizeHexColor } from '../../utils/security';
import { sigleConfig } from '../../config';
import { TipTapEditor } from '../editor/TipTapEditor';
import { styled } from '../../stitches.config';
import {
  Box,
  Container,
  Flex,
  IconButton,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../ui';
import { PoweredBy } from './PoweredBy';
import { getTextFromHtml } from '../editor/utils/getTextFromHtml';
import { AppHeader } from '../layout/components/AppHeader';
import format from 'date-fns/format';
import Link from 'next/link';
import { TwitterFilledIcon, FacebookLogoIcon } from '../../icons';
import { Link2Icon, LinkedInLogoIcon } from '@radix-ui/react-icons';
import { toast } from 'react-toastify';

const PublicStoryContainer = styled('div', {
  margin: '0 auto',
  paddingTop: '$15',
  paddingBottom: '$15',
  px: '$4',
});

interface ShareButtonsProps {
  story: Story;
}

const ShareButtons = ({ story }: ShareButtonsProps) => {
  const title = story.metaTitle ? story.metaTitle : story.title;

  const handleClick = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success('Link copied!', { position: 'top-right' }));
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
          }}
          side="top"
          sideOffset={8}
        >
          Copy link
        </TooltipContent>
      </Tooltip>
    </Flex>
  );
};

interface PublicStoryProps {
  story: Story;
  settings: SettingsFile;
}

export const PublicStory = ({ story, settings }: PublicStoryProps) => {
  const router = useRouter();
  const { username, storyId } = router.query as {
    username: string;
    storyId: string;
  };
  const storyReadingTime = useMemo(
    () =>
      story.content ? readingTime(getTextFromHtml(story.content)) : undefined,
    [story.content]
  );
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScroll = () => {
    if (window.scrollY > 200) {
      setIsShown(true);
    } else {
      setIsShown(false);
    }
  };

  const siteName = settings.siteName || username;
  const safeSiteColor =
    settings.siteColor && sanitizeHexColor(settings.siteColor);

  const seoUrl = `${sigleConfig.appUrl}/${username}/${storyId}`;
  const seoTitle = story.metaTitle || `${story.title} | Sigle`;
  const seoDescription = story.metaDescription;
  const seoImage = story.metaImage || story.coverImage;

  return (
    <>
      <NextSeo
        title={seoTitle}
        description={story.metaDescription}
        openGraph={{
          type: 'website',
          url: seoUrl,
          title: seoTitle,
          description: seoDescription,
          images: [
            {
              url: seoImage || `${sigleConfig.appUrl}/static/icon-192x192.png`,
            },
          ],
        }}
        twitter={{
          site: '@sigleapp',
          cardType: seoImage ? 'summary_large_image' : 'summary',
        }}
      />

      <AppHeader />

      <PublicStoryContainer
        className="prose dark:prose-invert lg:prose-lg sigle-content"
        css={{
          "& :where(a):not(:where([class~='not-prose'] *))": {
            color: safeSiteColor,
          },
          "& :where(a strong):not(:where([class~='not-prose'] *))": {
            color: safeSiteColor,
          },
        }}
      >
        <Flex justify="between" align="end" css={{ mb: '$7' }}>
          <Link href="/[username]" as={`/${username}`} passHref>
            <a className="not-prose">
              <Text size="action">{siteName}</Text>
              <Text
                size="action"
                css={{
                  display: 'flex',
                  gap: '$2',
                  color: '$gray9',
                  mt: '$1',
                }}
              >
                {format(story.createdAt, 'MMM dd')}
                <span>•</span>
                <span>{storyReadingTime?.text}</span>
              </Text>
            </a>
          </Link>
          <ShareButtons story={story} />
        </Flex>
        <h1 className="sigle-title">{story.title}</h1>
        {story.coverImage && (
          <Box
            css={{
              margin: '$8 auto',
              display: 'flex',
              justifyContent: 'center',
            }}
            className="not-prose"
          >
            <Box
              css={{
                '@md': {
                  marginLeft: '-$20',
                  marginRight: '-$20',
                },
              }}
            >
              <img className="sigle-cover" src={story.coverImage} />
            </Box>
          </Box>
        )}
        <TipTapEditor story={story} editable={false} />
        <Container
          css={{
            display: 'flex',
            position: 'relative',
            justifyContent: 'center',
            mb: '$5',
            '@xl': {
              justifyContent: 'end',
              bottom: 40,
              right: 0,
              left: 0,
              position: 'fixed',
              opacity: isShown ? 1 : 0,
              transform: isShown ? 'none' : 'translateY(100%)',
              transition: 'opacity 0.4s, transform 0.6s',
            },
          }}
        >
          <Box>
            <Text css={{ mt: 0, mb: '$3' }}>Share this story</Text>
            <ShareButtons story={story} />
          </Box>
        </Container>
        <PoweredBy />
      </PublicStoryContainer>
    </>
  );
};
