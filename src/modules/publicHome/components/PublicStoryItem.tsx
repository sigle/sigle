import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import { format } from 'date-fns';
import { SubsetStory } from '../../../types';

const StoryContainer = styled.div`
  ${tw`py-8 border-b border-solid border-grey-light`};
`;

const StoryTitle = styled.div<{ to?: string }>`
  ${tw`text-2xl font-bold no-underline text-black`};
  font-family: 'Libre Baskerville', serif;
`;

const StoryDate = styled.div`
  ${tw`mt-1 text-sm text-grey-dark`};
`;

const StoryText = styled.div`
  ${tw`mt-4 text-grey-darker`};
`;

interface Props {
  username: string;
  story: SubsetStory;
}

export const PublicStoryItem = ({ username, story }: Props) => (
  <StoryContainer>
    <StoryTitle as={Link} to={`/${username}/${story.id}`}>
      {story.title}
    </StoryTitle>
    <StoryDate>{format(story.createdAt, 'DD MMMM YYYY')}</StoryDate>
    <StoryText>{story.content}</StoryText>
  </StoryContainer>
);
