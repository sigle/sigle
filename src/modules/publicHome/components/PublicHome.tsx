import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import * as blockstack from 'blockstack';
import { toast } from 'react-toastify';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import { StoryFile } from '../../../types';
import { Container } from '../../../components';
import { PublicStoryItem } from './PublicStoryItem';
import { NotFound } from '../../layout/components/NotFound';
import {
  Header,
  HeaderContainer,
  HeaderTitle,
  HeaderLink,
} from '../../publicStory/components/PublicStory';

type Props = RouteComponentProps<{ username: string }>;

const StyledContainer = styled(Container)`
  ${tw`mt-4`};
`;

export const PublicHome = ({ match }: Props) => {
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<StoryFile | null>(null);

  const getUserFile = async () => {
    setLoading(true);
    try {
      let fileUrl = await blockstack.getUserAppFileUrl(
        'publicStories',
        match.params.username,
        window.location.origin
      );
      if (fileUrl) {
        fileUrl = `${fileUrl}.json`;
        const data = await fetch(fileUrl);
        if (data.status === 200) {
          const json = await data.json();
          setFile(json);
        }
      }
      setLoading(false);
    } catch (error) {
      // If blog not found do nothing
      if (error.message === 'Name not found') {
        setLoading(false);
        return;
      }
      console.error(error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserFile();
  }, [false]);

  if (loading) {
    return <Container>Loading ...</Container>;
  }

  if (!file) {
    return <NotFound error="File not found" />;
  }

  return (
    <React.Fragment>
      <Header>
        <HeaderContainer>
          <HeaderTitle>{match.params.username}</HeaderTitle>
          <HeaderLink to={`/${match.params.username}`}>Stories</HeaderLink>
        </HeaderContainer>
      </Header>
      <StyledContainer>
        {file.stories.map(story => (
          <PublicStoryItem
            key={story.id}
            username={match.params.username}
            story={story}
          />
        ))}
      </StyledContainer>
    </React.Fragment>
  );
};
