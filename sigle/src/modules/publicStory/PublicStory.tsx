import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import readingTime from 'reading-time';
import { useEffect, useMemo, useState } from 'react';
import { SettingsFile, Story } from '../../types';
import { sanitizeHexColor } from '../../utils/security';
import { sigleConfig } from '../../config';
import { TipTapEditor } from '../editor/TipTapEditor';
import { styled } from '../../stitches.config';
import { Box, Container, Flex, Typography } from '../../ui';
import { PoweredBy } from './PoweredBy';
import { getTextFromHtml } from '../editor/utils/getTextFromHtml';
import { AppHeader } from '../layout/components/AppHeader';
import format from 'date-fns/format';
import Link from 'next/link';
import { ShareButtons } from './ShareButtons';
import { generateAvatar } from '../../utils/boringAvatar';

const ProfileImageContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  br: '$1',
  overflow: 'hidden',
  width: 48,
  height: 48,
});

const ProfileImage = styled('img', {
  width: 'auto',
  height: '100%',
  maxWidth: 48,
  maxHeight: 48,
  objectFit: 'cover',
});

const PublicStoryContainer = styled('div', {
  margin: '0 auto',
  paddingTop: '$15',
  paddingBottom: '$15',
  px: '$4',
});

interface ShareButtonsOnScrollProps {
  username: string;
  story: Story;
  settings: SettingsFile;
}

const ShareButtonsOnScroll = ({
  username,
  story,
  settings,
}: ShareButtonsOnScrollProps) => {
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

  return (
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
        <Typography
          size="subheading"
          css={{ mt: 0, mb: '$3', color: '$gray11' }}
        >
          Share this story
        </Typography>
        <ShareButtons username={username} story={story} settings={settings} />
      </Box>
    </Container>
  );
};

interface PublicStoryProps {
  story: Story;
  settings: SettingsFile;
  userInfo: { username: string; address: string };
}

export const PublicStory = ({
  story,
  settings,
  userInfo,
}: PublicStoryProps) => {
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
        additionalLinkTags={[
          {
            rel: 'alternate',
            type: 'application/rss+xml',
            // @ts-expect-error title is missing in next-seo
            title: seoTitle,
            href: `${sigleConfig.appUrl}/api/feed/${userInfo.username}`,
          },
        ]}
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
        <Flex
          justify="between"
          align="end"
          css={{ mb: '$7' }}
          className="not-prose"
        >
          <Link href="/[username]" as={`/${username}`} passHref>
            <Flex as="a" align="center" gap="3">
              <ProfileImageContainer>
                <ProfileImage
                  src={
                    settings?.siteLogo
                      ? settings.siteLogo
                      : generateAvatar(userInfo.address)
                  }
                />
              </ProfileImageContainer>
              <Box>
                <Typography size="subheading">{siteName}</Typography>
                <Typography
                  size="subheading"
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
                </Typography>
              </Box>
            </Flex>
          </Link>
          <ShareButtons username={username} story={story} settings={settings} />
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
        <ShareButtonsOnScroll
          username={username}
          story={story}
          settings={settings}
        />
        <PoweredBy />
      </PublicStoryContainer>
    </>
  );
};
