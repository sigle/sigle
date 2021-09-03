import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled, { css, createGlobalStyle } from 'styled-components';
import tw from 'twin.macro';
import { Value } from 'slate';
import Html from 'slate-html-serializer';
import Plain from 'slate-plain-serializer';
import format from 'date-fns/format';
import { NextSeo } from 'next-seo';
import readingTime from 'reading-time';
import { Story, SettingsFile } from '../../../types';
import { Container } from '../../../components';
import { sigleConfig } from '../../../config';
import { sanitizeHexColor, sanitizeLink } from '../../../utils/security';
import { PoweredBy } from './PoweredBy';

const rules = [
  {
    serialize(obj: any, children: any) {
      if (obj.object === 'block') {
        switch (obj.type) {
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>;
          case 'block-quote':
            return <blockquote>{children}</blockquote>;
          case 'image':
            const src = obj.data.get('src');
            // eslint-disable-next-line
            return <img src={src} />;
          case 'list-item':
            return <li>{children}</li>;
          case 'numbered-list':
            return <ol>{children}</ol>;
          case 'bulleted-list':
            return <ul>{children}</ul>;
          case 'heading-one':
            return <h1>{children}</h1>;
          case 'heading-two':
            return <h2>{children}</h2>;
          case 'heading-three':
            return <h3>{children}</h3>;
        }
      }
    },
  },
  {
    serialize(obj: any, children: any) {
      if (obj.object === 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>;
          case 'italic':
            return <em>{children}</em>;
          case 'underlined':
            return <u>{children}</u>;
          case 'code':
            return <code>{children}</code>;
        }
      }
    },
  },
  {
    serialize(obj: any, children: any) {
      if (obj.object === 'inline') {
        switch (obj.type) {
          case 'link':
            const href: string = obj.data.get('href');
            const safeHref = sanitizeLink(href);

            if (!safeHref) {
              return <a href="/">🤯</a>;
            }
            return (
              <a href={safeHref} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
        }
      }
    },
  },
];

const html = new Html({ rules });

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

  const storyReadingTime = story.content
    ? readingTime(Plain.serialize(Value.fromJSON(story.content))).text
    : undefined;

  return (
    <React.Fragment>
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

      <StyledContainer hasCover={!!story.coverImage}>
        <Title className="sigle-title">{story.title}</Title>
        <StoryDate className="sigle-date">
          {format(story.createdAt, 'dd MMMM yyyy')} • {storyReadingTime}
        </StoryDate>
        {story.coverImage && (
          <Cover>
            <CoverImage className="sigle-cover" src={story.coverImage} />
          </Cover>
        )}
        <Content
          className="sigle-content"
          dangerouslySetInnerHTML={{
            __html: story.content
              ? html.serialize(Value.fromJSON(story.content))
              : '',
          }}
        />
        <PoweredBy />
      </StyledContainer>
    </React.Fragment>
  );
};
