import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { format } from 'date-fns';
import { Value } from 'slate';
import Html from 'slate-html-serializer';
import dompurify from 'dompurify';
import { TiSocialFacebook, TiSocialTwitter } from 'react-icons/ti';
import { PublicStory as PublicStoryModel } from '../../models';
import { defaultUserImage } from '../../utils';
import { config } from '../../config';

const StoryContainer = styled.div`
  ${tw`py-8`};

  @media (min-width: ${config.breakpoints.sm}px) {
    ${tw`py-16`};
  }
`;

const StoryTitle = styled.h1`
  ${tw`text-4xl font-bold mb-4`};
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

const StoryCoverImage = styled.img``;

const StoryContent = styled.p`
  ${tw`mt-8 mb-24`};

  ${tw`text-base leading-tight`};

  p,
  ol,
  ul {
    ${tw`mb-4`};
  }

  li + li {
    ${tw`mt-2`};
  }

  blockquote {
    ${tw`mb-4 py-4 px-4 italic text-sm`};
    border-left: 3px solid #ccc;
    letter-spacing: 0.01rem;
  }

  h1 {
    ${tw`mt-6 mb-4 text-4xl`};
  }

  h2 {
    ${tw`mt-6 mb-4 text-3xl`};
  }

  h3 {
    ${tw`mt-6 mb-4 text-2xl`};
  }

  img {
    margin: auto;
  }

  a {
    ${tw`underline text-primary`};
  }
`;

const StorySocial = styled.div`
  ${tw`flex justify-end my-4`};

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
  storyId: string;
}

export const PublicStory = ({ storyId }: Props) => {
  // TODO fetch with graphql and setup SEO
  const [story, setStory] = useState<Story>();

  const fetchStory = async () => {
    const publicStory = await PublicStoryModel.findById(storyId);
    if (publicStory) {
      setStory({
        title: publicStory.attrs.title,
        createdAt: publicStory.attrs.createdAt,
        content: dompurify.sanitize(
          html.serialize(Value.fromJSON(
            JSON.parse(publicStory.attrs.content)
          ) as any)
        ),
        imageUrl:
          'https://images.unsplash.com/photo-1558980664-769d59546b3d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2100&q=80',
        user: {
          username: 'leopradel.id.blockstack',
          name: 'Leo Pradel',
          imageUrl: defaultUserImage('leopradel.id.blockstack', 100),
        },
      });
    }
  };

  useEffect(() => {
    fetchStory();
  }, []);

  if (!story) {
    // TODO nice 404
    return null;
  }

  return (
    <StoryContainer>
      <StoryItemDate>{format(story.createdAt, 'DD MMMM YYYY')}</StoryItemDate>
      <StoryTitle>{story.title}</StoryTitle>
      <StoryProfile>
        <StoryProfileImage
          alt={`Profile image of ${story.user.username}`}
          src={story.user.imageUrl}
        />
        <div>
          <StoryProfileName>{story.user.name}</StoryProfileName>
          <StoryProfileUsername>{story.user.username}</StoryProfileUsername>
        </div>
      </StoryProfile>
      {!story.imageUrl && <StoryDivider />}
      {story.imageUrl && (
        <StoryCover>
          <StoryCoverImage src={story.imageUrl} />
        </StoryCover>
      )}
      <StoryContent
        dangerouslySetInnerHTML={{
          __html: story.content,
        }}
      />
      {/* TODO share to social media */}
      <StorySocial>
        <TiSocialFacebook size={24} />
        <TiSocialTwitter size={24} />
      </StorySocial>
      <StoryDivider />
      <StoryAbout>About the author</StoryAbout>
      <StoryFooter>
        <StoryFooterImage
          alt={`Profile image of ${story.user.username}`}
          src={story.user.imageUrl}
        />
        <div>
          <StoryFooterName>{story.user.name}</StoryFooterName>
          <StoryFooterUsername>{story.user.username}</StoryFooterUsername>
          <StoryFooterDescription>Lorem ipsum</StoryFooterDescription>
        </div>
      </StoryFooter>
    </StoryContainer>
  );
};
