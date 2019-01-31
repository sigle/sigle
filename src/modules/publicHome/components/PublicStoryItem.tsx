import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import { format } from 'date-fns';
import { SubsetStory } from '../../../types';

const StoryContainer = styled.div`
  ${tw`py-8 border-b border-solid border-grey-light`};
`;

const StoryTitle = styled.div`
  ${tw`text-2xl font-bold no-underline text-black`};
`;

const StoryDate = styled.div`
  ${tw`text-sm italic text-grey-dark`};
`;

const StoryText = styled.div`
  ${tw`mt-4 text-grey-dark`};
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
    <StoryDate>{format(story.createdAt, 'HH:mm DD MMMM YYYY')}</StoryDate>
    <StoryText>{story.content}</StoryText>
  </StoryContainer>
);
