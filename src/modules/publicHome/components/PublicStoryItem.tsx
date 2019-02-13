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
    ${tw`w-1/3`};
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
    </StoryContainerContent>
  </StoryContainer>
);
