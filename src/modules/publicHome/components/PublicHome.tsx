import React from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { StoryFile } from '../../../types';
import { Container } from '../../../components';
import { PublicStoryItem } from './PublicStoryItem';
import {
  Header,
  HeaderContainer,
  HeaderTitle,
  HeaderLink,
} from '../../publicStory/components/PublicStory';

const StyledContainer = styled(Container)`
  ${tw`mt-4`};
  max-width: 768px;
`;

const NoStories = styled.p`
  ${tw`mt-8 text-center`};
`;

interface PublicHomeProps {
  file: StoryFile;
}

export const PublicHome = ({ file }: PublicHomeProps) => {
  const router = useRouter();
  const { username } = router.query as { username: string };

  return (
    <React.Fragment>
      <Header>
        <HeaderContainer>
          <HeaderTitle>{username}</HeaderTitle>
          <Link href="/[username]" as={`/${username}`}>
            <HeaderLink>Stories</HeaderLink>
          </Link>
        </HeaderContainer>
      </Header>
      <StyledContainer>
        {file.stories.length === 0 && <NoStories>No stories yet</NoStories>}
        {file.stories.map(story => (
          <PublicStoryItem key={story.id} username={username} story={story} />
        ))}
      </StyledContainer>
    </React.Fragment>
  );
};
