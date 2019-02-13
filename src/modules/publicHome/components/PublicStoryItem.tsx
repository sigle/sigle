import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components/macro';
import tw from 'tailwind.macro';
import { format } from 'date-fns';
import { SubsetStory } from '../../../types';
import { config } from '../../../config';

const StoryContainer = styled.div`
  ${tw`py-8 border-b border-solid border-grey-light`};

  @media (min-width: ${config.breakpoints.md}px) {
    ${tw`flex`};
  }
`;

const StoryContainerImage = styled.div`
  ${tw`mb-4`};

  @media (min-width: ${config.breakpoints.md}px) {
    ${tw`w-1/3 mb-0`};
  }
`;

const StoryImage = styled.img`
  display: block;
  max-width: 100%;
`;

const StoryContainerContent = styled.div<{ hasCover: boolean }>`
  ${props =>
    props.hasCover &&
    css`
      @media (min-width: ${config.breakpoints.md}px) {
        ${tw`w-2/3 pl-4`};
      }
    `}
`;

const StoryTitle = styled.div<{ to?: string }>`
  ${tw`text-2xl font-bold no-underline text-black`};
  font-family: 'Libre Baskerville', serif;
`;

const StoryDate = styled.div`
  ${tw`mt-1 text-sm text-grey-dark`};
`;

const StoryText = styled.div`
  ${tw`mt-4 text-grey-darker leading-tight`};
`;

const StoryButton = styled(Link)`
  ${tw`inline-block mt-8 py-1 px-2 rounded-lg text-sm text-black border border-solid border-black no-underline`};

  &:hover {
    ${tw`bg-black text-white`};
  }
`;

interface Props {
  username: string;
  story: SubsetStory;
}

export const PublicStoryItem = ({ username, story }: Props) => (
  <StoryContainer>
    {story.coverImage && (
      <StoryContainerImage>
        <StoryImage src={story.coverImage} />
      </StoryContainerImage>
    )}
    <StoryContainerContent hasCover={!!story.coverImage}>
      <StoryTitle as={Link} to={`/${username}/${story.id}`}>
        {story.title}
      </StoryTitle>
      <StoryDate>{format(story.createdAt, 'DD MMMM YYYY')}</StoryDate>
      <StoryText>{story.content}</StoryText>
      <StoryButton to={`/${username}/${story.id}`}>Read more</StoryButton>
    </StoryContainerContent>
  </StoryContainer>
);
