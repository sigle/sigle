/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { graphql, createFragmentContainer } from 'react-relay';
import format from 'date-fns/format';
import { PublicStoryItem_story } from './__generated__/PublicStoryItem_story.graphql';
import Link from 'next/link';

const StoryContainer = styled.div`
  ${tw`w-full lg:flex py-4 border-b border-grey`};
  &:last-child {
    border: none;
  }
`;

const StoryCover = styled.div<{ coverImageUrl: string | null }>`
  ${tw`h-48 lg:h-auto lg:w-64 flex-none bg-cover bg-center overflow-hidden mb-4 lg:mb-0 lg:mr-4`};
  ${props =>
    props.coverImageUrl &&
    css`
      background-image: url('${props.coverImageUrl}');
    `}
`;

const StoryContent = styled.div`
  ${tw`flex flex-col justify-between leading-normal`};
`;

const StoryTitle = styled.div`
  ${tw`text-xl font-medium`};
`;

const StoryDate = styled.div`
  ${tw`text-grey-darker mb-2 text-sm`};
`;

const StoryText = styled.div`
  ${tw`mb-2 lg:text-sm`};
`;

// const StoryTags = styled.div`
//   ${tw`text-grey-darker font-light text-sm italic`};
// `;

const StoryProfile = styled.div`
  ${tw`flex items-center`};
`;

const StoryProfileImage = styled.img`
  ${tw`w-8 h-8 rounded-full mr-2`};
`;

const StoryProfileName = styled.div`
  ${tw`text-sm`};
`;

interface Props {
  story: PublicStoryItem_story;
}

export const PublicStoryItemComponent = ({ story }: Props) => {
  const userDisplayName = story.user.name || story.user.username;
  const storyLink = `/@${story.user.username}/${story._id}`;

  return (
    <StoryContainer>
      <StoryCover coverImageUrl={story.coverImageUrl} />
      <StoryContent>
        <StoryTitle>
          <Link
            href={{
              pathname: '/story',
              query: { username: story.user.username, storyId: story._id },
            }}
            as={storyLink}
          >
            <a>{story.title}</a>
          </Link>
        </StoryTitle>
        <StoryDate>
          {story.createdAt
            ? format(Number(story.createdAt), 'DD MMMM YYYY')
            : 'Invalid date'}
        </StoryDate>
        <StoryText>{story.excerpt}</StoryText>
        {/* TODO display the story tags */}
        {/* <StoryTags>Travel, lifestyle</StoryTags> */}
        <StoryProfile>
          {story.user.imageUrl && (
            <StoryProfileImage
              alt={`Profile image of ${story.user.username}`}
              src={story.user.imageUrl}
            />
          )}
          <StoryProfileName>{userDisplayName}</StoryProfileName>
        </StoryProfile>
      </StoryContent>
    </StoryContainer>
  );
};

export const PublicStoryItem = createFragmentContainer(
  PublicStoryItemComponent,
  {
    story: graphql`
      fragment PublicStoryItem_story on PublicStory {
        id
        _id
        title
        excerpt
        coverImageUrl(width: 1000)
        createdAt
        user {
          id
          username
          name
          imageUrl(size: 32)
        }
      }
    `,
  }
);
