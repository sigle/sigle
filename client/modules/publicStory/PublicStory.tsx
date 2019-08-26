/* eslint-disable @typescript-eslint/camelcase */
import React, { useMemo } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { createFragmentContainer, graphql } from 'react-relay';
import Head from 'next/head';
import Link from 'next/link';
import format from 'date-fns/format';
import { Value } from 'slate';
import Html from 'slate-html-serializer';
import DOMPurify from 'dompurify';
import { TiSocialFacebook, TiSocialTwitter } from 'react-icons/ti';
import { config } from '../../config';
import { PublicStory_story } from './__generated__/PublicStory_story.graphql';
import { getProfileRoute } from '../../utils/routes';
import { Container } from '../../components';

let dompurify = DOMPurify();

// During ssr we need jsdom to make dompurify work
if (typeof window === 'undefined') {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const { JSDOM } = require('jsdom');
  const { window } = new JSDOM('<!DOCTYPE html>');
  dompurify = DOMPurify(window);
}

const StoryContainer = styled(Container)`
  ${tw`py-8`};
  max-width: 768px;

  @media (min-width: ${config.breakpoints.sm}px) {
    ${tw`py-16`};
  }
`;

const StoryTitle = styled.h1`
  ${tw`text-4xl font-bold mb-4 leading-tight`};
`;

const StoryItemDate = styled.p`
  ${tw`text-grey-darker`};
`;

const StoryProfile = styled.div`
  ${tw`flex items-center mb-8`};
`;

const StoryProfileImage = styled.img`
  ${tw`w-12 h-12 rounded-full mr-2`};
`;

const StoryProfileName = styled.p`
  ${tw`-mb-1`};
`;

const StoryProfileUsername = styled.p`
  ${tw`text-sm text-grey-darker italic`};
`;

const StoryDivider = styled.div`
  ${tw`border-b border-grey`};
`;

const StoryCover = styled.div`
  ${tw`-ml-4 -mr-4`};

  @media (min-width: ${config.breakpoints.xl}px) {
    ${tw`-ml-20 -mr-20`};
  }
`;

const StoryCoverImage = styled.img`
  ${tw`m-auto`};
`;

const StoryContent = styled.div`
  ${tw`mt-8 mb-24`};

  ${tw`text-lg leading-relaxed text-grey-darker`};

  p,
  ol,
  ul {
    ${tw`mb-4`};
  }

  li + li {
    ${tw`mt-2`};
  }

  ul {
    ${tw`list-disc`};
    list-style-position: inside;
  }
  ol {
    ${tw`list-decimal`};
    list-style-position: inside;
  }

  blockquote {
    ${tw`mb-4 py-4 px-4 italic text-sm`};
    border-left: 3px solid #ccc;
    letter-spacing: 0.01rem;
  }

  h1 {
    ${tw`mt-6 mb-4 text-3xl`};
  }

  h2 {
    ${tw`mt-6 mb-4 text-2xl`};
  }

  a {
    ${tw`underline text-primary`};
  }

  img {
    margin: 2rem auto;
  }
`;

const StorySocial = styled.div`
  ${tw`flex justify-end my-4`};

  a:hover {
    ${tw`text-primary`};
  }

  svg:first-child {
    ${tw`mr-6`};
  }
`;

const StoryAbout = styled.p`
  ${tw`mt-4 text-grey-darker`};
`;

const StoryFooter = styled.div`
  ${tw`flex items-center mt-4`};
`;

const StoryFooterImageContainer = styled.a`
  ${tw`mr-2 lg:mr-4`};
`;

const StoryFooterImage = styled.img`
  ${tw`w-32 h-32 rounded-full mr-2 lg:mr-4`};
`;

const StoryFooterName = styled.p`
  ${tw`-mb-1 text-2xl font-bold`};
`;

const StoryFooterUsername = styled.p`
  ${tw`text-sm text-grey-darker italic`};
`;

const StoryFooterDescription = styled.p`
  ${tw`lg:text-sm`};
`;

const rules = [
  {
    serialize(obj: any, children: any) {
      if (obj.object == 'block') {
        switch (obj.type) {
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>;
          case 'block-quote':
            return <blockquote>{children}</blockquote>;
          case 'image':
            const src = obj.data.get('src');
            const optimizedSrc = `https://images.weserv.nl/?url=${src}&w=1200&t=fit`;
            return <img src={optimizedSrc} />;
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
      if (obj.object == 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>;
          case 'italic':
            return <em>{children}</em>;
          case 'underlined':
            return <u>{children}</u>;
        }
      }
    },
  },
  {
    serialize(obj: any, children: any) {
      if (obj.object == 'inline') {
        switch (obj.type) {
          case 'link':
            const href = obj.data.get('href');
            return <a href={href}>{children}</a>;
        }
      }
    },
  },
];

const html = new Html({ rules });

interface Story {
  title: string;
  createdAt: string;
  content: string;
  imageUrl?: string;
  user: {
    username: string;
    name: string;
    imageUrl: string;
  };
}

interface Props {
  story: PublicStory_story;
}

export const PublicStoryComponent = ({ story }: Props) => {
  const sanitizedContent = useMemo(() => {
    return (
      story.content &&
      dompurify.sanitize(
        html.serialize(Value.fromJSON(JSON.parse(story.content)))
      )
    );
  }, [story.content]);

  const seoUrl = `${config.appUrl}/@${story.user.username}/${story._id}`;
  const seoTitle = `${story.metaTitle || story.title} | ${story.user.name ||
    story.user.username} | Sigle`;
  const seoDescription = story.metaDescription || story.excerpt;

  const twitterShare = encodeURI(
    `${story.metaTitle || story.title} | @sigleapp ${seoUrl}`
  );

  const profileRoute = getProfileRoute({ username: story.user.username });

  return (
    <StoryContainer>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription || ''} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Sigle" />
        <meta property="og:url" content={seoUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription || ''} />
        <meta
          property="og:image"
          content={
            story.coverImageUrl
              ? story.coverImageUrl
              : `${config.appUrl}/static/android-chrome-192x192.png`
          }
        />
        <meta name="twitter:site" content="@sigleapp" />
        <meta
          name="twitter:card"
          content={story.coverImageUrl ? 'summary_large_image' : 'summary'}
        />
      </Head>
      {story.createdAt && (
        <StoryItemDate>
          {format(Number(story.createdAt), 'dd MMMM yyyy')}
        </StoryItemDate>
      )}
      <StoryTitle>{story.title}</StoryTitle>
      <StoryProfile>
        <Link href={profileRoute.href} as={profileRoute.as}>
          <a>
            <StoryProfileImage
              alt={`Profile image of ${story.user.username}`}
              src={story.user.imageUrl}
            />
          </a>
        </Link>
        <div>
          <Link href={profileRoute.href} as={profileRoute.as}>
            <a>
              <StoryProfileName>{story.user.name}</StoryProfileName>
            </a>
          </Link>
          <Link href={profileRoute.href} as={profileRoute.as}>
            <a>
              <StoryProfileUsername>{story.user.username}</StoryProfileUsername>
            </a>
          </Link>
        </div>
      </StoryProfile>
      {!story.coverImageUrl && <StoryDivider />}
      {story.coverImageUrl && (
        <StoryCover>
          <StoryCoverImage src={story.coverImageUrl} />
        </StoryCover>
      )}
      {sanitizedContent && (
        <StoryContent
          dangerouslySetInnerHTML={{
            __html: sanitizedContent,
          }}
        />
      )}
      <StorySocial>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${seoUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <TiSocialFacebook size={24} />
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${twitterShare}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <TiSocialTwitter size={24} />
        </a>
      </StorySocial>
      <StoryDivider />
      <StoryAbout>About the author</StoryAbout>
      <StoryFooter>
        <Link href={profileRoute.href} as={profileRoute.as}>
          <StoryFooterImageContainer>
            <StoryFooterImage
              alt={`Profile image of ${story.user.username}`}
              src={story.user.imageUrl}
            />
          </StoryFooterImageContainer>
        </Link>
        <div>
          <Link href={profileRoute.href} as={profileRoute.as}>
            <a>
              <StoryFooterName>{story.user.name}</StoryFooterName>
            </a>
          </Link>
          <Link href={profileRoute.href} as={profileRoute.as}>
            <a>
              <StoryFooterUsername>{story.user.username}</StoryFooterUsername>
            </a>
          </Link>
          <StoryFooterDescription>
            {story.user.description}
          </StoryFooterDescription>
        </div>
      </StoryFooter>
    </StoryContainer>
  );
};

export const PublicStory = createFragmentContainer(PublicStoryComponent, {
  story: graphql`
    fragment PublicStory_story on PublicStory {
      id
      _id
      title
      content
      coverImageUrl(width: 1200)
      createdAt
      metaTitle
      metaDescription
      excerpt
      user {
        id
        username
        name
        description
        imageUrl(size: 128)
      }
    }
  `,
});
