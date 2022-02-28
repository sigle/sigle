import { useRouter } from 'next/router';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { SettingsFile, Story } from '../../types';
import { sanitizeHexColor } from '../../utils/security';
import { sigleConfig } from '../../config';
import { TipTapEditor } from '../editor/TipTapEditor';
import { styled } from '../../stitches.config';
import { Box } from '../../ui';
import { PoweredBy } from './components/PoweredBy';

// const CustomStyle = createGlobalStyle<{ siteColor?: string }>`
//   ${(props) =>
//     props.siteColor &&
//     css`
//       .sigle-date {
//         color: ${props.siteColor} !important;
//       }
//       .sigle-content a,
//       .sigle-content a strong {
//         color: ${props.siteColor} !important;
//       }
//     `}
// `;

const PublicStoryContainer = styled('div', {
  margin: '0 auto',
  paddingTop: '$15',
  paddingBottom: '$15',
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

  const siteName = settings.siteName || username;
  const safeSiteColor =
    settings.siteColor && sanitizeHexColor(settings.siteColor);

  const seoUrl = `${sigleConfig.appUrl}/${username}/${storyId}`;
  const seoTitle = story.metaTitle || `${story.title} | Sigle`;
  const seoDescription = story.metaDescription;

  // TODO in a separate PR
  const storyReadingTime = undefined;

  const showCoverImage = story.coverImage && !story.hideCoverImage;

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
              url: story.coverImage
                ? story.coverImage
                : `${sigleConfig.appUrl}/static/icon-192x192.png`,
            },
          ],
        }}
        twitter={{
          site: '@sigleapp',
          cardType: story.coverImage ? 'summary_large_image' : 'summary',
        }}
      />

      {/* TODO find how to do this */}
      {/* <CustomStyle siteColor={safeSiteColor} /> */}
      <PublicStoryContainer className="prose lg:prose-lg sigle-content">
        <h1 className="sigle-title">{story.title}</h1>
        {showCoverImage && (
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
