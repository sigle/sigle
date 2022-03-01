import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import readingTime from 'reading-time';
import { useMemo } from 'react';
import { SettingsFile, Story } from '../../types';
import { sanitizeHexColor } from '../../utils/security';
import { sigleConfig } from '../../config';
import { TipTapEditor } from '../editor/TipTapEditor';
import { styled } from '../../stitches.config';
import { Box, Text } from '../../ui';
import { PoweredBy } from './components/PoweredBy';
import { getTextFromHtml } from '../editor/utils/getTextFromHtml';
import { AppHeader } from '../layout/components/AppHeader';
import format from 'date-fns/format';
import Link from 'next/link';

const PublicStoryContainer = styled('div', {
  margin: '0 auto',
  paddingTop: '$15',
  paddingBottom: '$15',
  px: '$4',
});

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
        className="prose lg:prose-lg sigle-content"
        css={{
          "& :where(a):not(:where([class~='not-prose'] *))": {
            color: safeSiteColor,
          },
          "& :where(a strong):not(:where([class~='not-prose'] *))": {
            color: safeSiteColor,
          },
        }}
      >
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
                mb: '$7',
              }}
            >
              {format(story.createdAt, 'MMM dd')}
              <span>•</span>
              <span>{storyReadingTime?.text}</span>
            </Text>
          </a>
        </Link>
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
                marginLeft: '-$20',
                marginRight: '-$20',
                width: '100%',
              }}
            >
              <img className="sigle-cover" src={story.coverImage} />
            </Box>
          </Box>
        )}
        <TipTapEditor story={story} editable={false} />
        <PoweredBy />
      </PublicStoryContainer>
    </>
  );
};
