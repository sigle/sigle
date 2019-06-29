import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { format } from 'date-fns';
import { Value } from 'slate';
import Html from 'slate-html-serializer';
import dompurify from 'dompurify';
import { PrivateStory } from '../../models';
import { defaultUserImage } from '../../utils';

const StoryContainer = styled.div`
  ${tw`py-16`};
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

const StoryContent = styled.p`
  ${tw`mt-8`};

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

const storyId = '4e5e23c8e246-41bd-b8e3-b03dea674f35';

interface Story {
  title: string;
  createdAt: string;
  content: string;
  user: {
    username: string;
    name: string;
    imageUrl: string;
  };
}

export const PublicStory = () => {
  // TODO fetch with graphql and setup SEO
  const [story, setStory] = useState<Story>();

  const fetchStory = async () => {
    const privateStory = await PrivateStory.findById(storyId);
    console.log(privateStory.attrs);
    setStory({
      title: privateStory.attrs.title,
      createdAt: privateStory.attrs.createdAt,
      content: dompurify.sanitize(
        html.serialize(Value.fromJSON(
          JSON.parse(privateStory.attrs.content)
        ) as any)
      ),
      user: {
        username: 'leopradel.id.blockstack',
        name: 'Leo Pradel',
        imageUrl: defaultUserImage('leopradel.id.blockstack', 48),
      },
    });
  };

  useEffect(() => {
    fetchStory();
  }, []);

  if (!story) {
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
      <StoryDivider />
      <StoryContent
        dangerouslySetInnerHTML={{
          __html: story.content,
        }}
      />
    </StoryContainer>
  );
};
