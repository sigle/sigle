import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { graphql, createFragmentContainer } from 'react-relay';
import { PublicStoryItem_story } from './__generated__/PublicStoryItem_story.graphql';
import Link from 'next/link';

const StoryContainer = styled.div`
  ${tw`w-full lg:flex py-4 border-b border-grey`};
  &:last-child {
    border: none;
  }
`;

const StoryCover = styled.div`
  ${tw`h-48 lg:h-auto lg:w-64 flex-none bg-cover bg-center overflow-hidden mb-4 lg:mb-0 lg:mr-4`};
  background-image: url('https://source.unsplash.com/random/256x183');
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

const StoryTags = styled.div`
  ${tw`text-grey-darker font-light text-sm italic`};
`;

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
      <StoryCover />
      <StoryContent>
        <StoryTitle>
          <Link href={storyLink}>
            <a>{story.title}</a>
          </Link>
        </StoryTitle>
        {/* TODO display real date */}
        <StoryDate>January 26, 2017</StoryDate>
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
