import { useRouter } from 'next/router';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import readingTime from 'reading-time';
import { convert } from '@sigle/slate-to-markdown';
import styled, { css, createGlobalStyle } from 'styled-components';
import tw from 'twin.macro';
import format from 'date-fns/format';
import ReactMarkdown from 'react-markdown';
import { sigleConfig } from '../../config';
import { SettingsFile, Story } from '../../types';
import { sanitizeHexColor } from '../../utils/security';
import { Container } from '../../components';
import { PoweredBy } from './PoweredBy';

const Header = styled.div`
  ${tw`py-6 text-black`};
`;

const HeaderContainer = styled.div`
  ${tw`mx-auto px-4 flex`};
  width: 100%;
  max-width: 768px;
`;

const HeaderTitle = styled.a`
  ${tw`font-bold text-xl`};
`;

const StyledContainer = styled(Container)<{ hasCover: boolean }>`
  ${tw`mb-16`}
  max-width: 768px;

  ${(props) =>
    !props.hasCover &&
    css`
      .sigle-content {
        ${tw`mt-16`};
      }
    `}
`;

const Title = styled.div`
  ${tw`text-4xl mt-16 font-bold text-center`};
`;

const StoryDate = styled.div`
  ${tw`text-sm mt-4 text-center text-pink`};
`;

const Cover = styled.div`
  ${tw`mt-8 -ml-4 -mr-4`};

  @media (min-width: ${sigleConfig.breakpoints.xl}px) {
    ${tw`-ml-20 -mr-20`};
  }
`;

const CoverImage = styled.img`
  ${tw`m-auto`};
`;

export const Content = styled.div`
  ${tw`mt-8 prose lg:prose-lg`};
  max-width: none;

  p {
    min-height: 1rem;
  }

  a {
    ${tw`text-pink no-underline font-normal`};
  }
  a strong {
    ${tw`text-pink`};
  }

  h1 {
    ${tw`text-4xl`};
  }

  code {
    ${tw`bg-grey-light px-1 rounded-sm`};
  }

  img {
    max-height: 100em;
  }
`;

const CustomStyle = createGlobalStyle<{ siteColor?: string }>`
  ${(props) =>
    props.siteColor &&
    css`
      .sigle-date {
        color: ${props.siteColor} !important;
      }
      .sigle-content a,
      .sigle-content a strong {
        color: ${props.siteColor} !important;
      }
    `}
`;

interface PublicStoryProps {
  story: Story;
  settings: SettingsFile;
}

export const PublicStoryMarkdown = ({ story, settings }: PublicStoryProps) => {
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

  // TODO from the markdown text
  // const storyReadingTime = story.content
  //   ? readingTime(Plain.serialize(Value.fromJSON(story.content))).text
  //   : undefined;

  const showCoverImage = story.coverImage && !story.hideCoverImage;

  const content = story.content ? convert(story.content.document.nodes) : '';

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

      <CustomStyle siteColor={safeSiteColor} />

      <Header>
        <HeaderContainer>
          <Link href="/[username]" as={`/${username}`} passHref>
            <HeaderTitle>{siteName}</HeaderTitle>
          </Link>
        </HeaderContainer>
      </Header>

      <StyledContainer hasCover={!!showCoverImage}>
        <Title className="sigle-title">{story.title}</Title>
        <StoryDate className="sigle-date">
          {format(story.createdAt, 'dd MMMM yyyy')} • {'{storyReadingTime}'}
        </StoryDate>
        {showCoverImage && (
          <Cover>
            <CoverImage className="sigle-cover" src={story.coverImage} />
          </Cover>
        )}
        <Content
          as={ReactMarkdown}
          className="sigle-content"
          children={content}
        />
        <PoweredBy />
      </StyledContainer>
    </>
  );
};
